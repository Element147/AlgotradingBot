package com.algotrader.bot.controller;

public class BackupResponse {

    private String path;
    private String size;

    public BackupResponse() {
    }

    public BackupResponse(String path, String size) {
        this.path = path;
        this.size = size;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }
}
