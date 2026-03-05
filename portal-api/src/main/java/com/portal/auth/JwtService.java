package com.portal.auth;

import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.time.Duration;
import java.util.Set;

@ApplicationScoped
public class JwtService {

    @ConfigProperty(name = "smallrye.jwt.new-token.issuer", defaultValue = "https://portal.example.com")
    String issuer;

    @ConfigProperty(name = "smallrye.jwt.new-token.lifespan", defaultValue = "28800")
    long lifespanSeconds;

    public String generateToken(String username, String fullName, String email, Set<String> roles) {
        return Jwt.issuer(issuer)
            .subject(username)
            .groups(roles)
            .claim("fullName", fullName)
            .claim("email", email)
            .expiresIn(Duration.ofSeconds(lifespanSeconds))
            .sign();
    }

    public long getLifespanSeconds() {
        return lifespanSeconds;
    }
}
