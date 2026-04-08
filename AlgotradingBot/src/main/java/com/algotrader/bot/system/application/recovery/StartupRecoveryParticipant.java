package com.algotrader.bot.system.application.recovery;

public interface StartupRecoveryParticipant {

    String participantName();

    int recoverPendingWork();
}
