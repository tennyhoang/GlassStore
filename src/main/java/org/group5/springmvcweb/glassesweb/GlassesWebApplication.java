package org.group5.springmvcweb.glassesweb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync        // bat @Async cho EmailService gui email bat dong bo
@EnableScheduling   // bat @Scheduled cho don dep token het han
@EnableCaching      // bat @Cacheable cho ProductService
public class GlassesWebApplication {

    public static void main(String[] args) {
        SpringApplication.run(GlassesWebApplication.class, args);
    }
}