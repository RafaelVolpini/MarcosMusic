package com.marcos.music.integration.google;

import java.util.UUID;

public record GoogleAuthState(UUID userId, String returnUrl) {}
