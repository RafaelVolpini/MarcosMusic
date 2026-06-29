package com.marcos.music;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MarcosMusicApplication {
    public static void main(String[] args) {
        SpringApplication.run(MarcosMusicApplication.class, args);
    }
}