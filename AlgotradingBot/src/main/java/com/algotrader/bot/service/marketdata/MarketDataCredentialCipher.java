package com.algotrader.bot.service.marketdata;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class MarketDataCredentialCipher {

    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final String KEY_ALGORITHM = "AES";
    private static final String VERSION = "AES_GCM_V1";
    private static final int GCM_TAG_BITS = 128;
    private static final int IV_LENGTH_BYTES = 12;

    private final SecureRandom secureRandom = new SecureRandom();
    private final String masterKey;

    public MarketDataCredentialCipher(
        @Value("${algotrading.market-data.credentials.master-key:}") String masterKey
    ) {
        this.masterKey = masterKey == null ? "" : masterKey.trim();
    }

    public boolean isConfigured() {
        return !masterKey.isBlank();
    }

    public String version() {
        return VERSION;
    }

    public EncryptedValue encrypt(String plaintext) {
        if (!isConfigured()) {
            throw new IllegalStateException(
                "Set ALGOTRADING_MARKET_DATA_CREDENTIALS_MASTER_KEY before saving encrypted market-data API keys."
            );
        }
        if (plaintext == null || plaintext.isBlank()) {
            throw new IllegalArgumentException("API key cannot be blank.");
        }

        try {
            byte[] iv = new byte[IV_LENGTH_BYTES];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, deriveKey(), new GCMParameterSpec(GCM_TAG_BITS, iv));
            byte[] encrypted = cipher.doFinal(plaintext.trim().getBytes(StandardCharsets.UTF_8));

            return new EncryptedValue(
                Base64.getEncoder().encodeToString(encrypted),
                Base64.getEncoder().encodeToString(iv),
                VERSION
            );
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to encrypt market-data API key.", exception);
        }
    }

    public String decrypt(String ciphertext, String iv, String version) {
        if (!VERSION.equals(version)) {
            throw new IllegalStateException("Unsupported market-data credential encryption version: " + version);
        }
        if (!isConfigured()) {
            throw new IllegalStateException(
                "Stored market-data API keys cannot be decrypted until ALGOTRADING_MARKET_DATA_CREDENTIALS_MASTER_KEY is set."
            );
        }

        try {
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(
                Cipher.DECRYPT_MODE,
                deriveKey(),
                new GCMParameterSpec(GCM_TAG_BITS, Base64.getDecoder().decode(iv))
            );
            byte[] decrypted = cipher.doFinal(Base64.getDecoder().decode(ciphertext));
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to decrypt stored market-data API key.", exception);
        }
    }

    private SecretKeySpec deriveKey() throws Exception {
        byte[] hash = MessageDigest.getInstance("SHA-256").digest(masterKey.getBytes(StandardCharsets.UTF_8));
        return new SecretKeySpec(hash, KEY_ALGORITHM);
    }

    public record EncryptedValue(
        String ciphertext,
        String iv,
        String version
    ) {
    }
}
