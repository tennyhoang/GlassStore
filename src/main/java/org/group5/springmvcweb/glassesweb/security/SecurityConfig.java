package org.group5.springmvcweb.glassesweb.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class SecurityConfig {

    // TẠM KHÔNG @Autowired JwtAuthenticationFilter để bypass filter token
    // @Autowired
    // private JwtAuthenticationFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Cho phép hoàn toàn login và các endpoint của BE3 (test không cần token)
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/api/eye-profiles/**").permitAll()
                        .requestMatchers("/api/eye-prescriptions/**").permitAll()
                        // Còn lại yêu cầu login (có thể tạm permitAll hết để test)
                        .anyRequest().permitAll()  // Tạm cho phép hết để test nhanh
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setContentType("application/json");
                            response.setStatus(401);
                            response.getWriter().write("{\"error\": \"Not logged in!\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setContentType("application/json");
                            response.setStatus(403);
                            response.getWriter().write("{\"error\": \"You are not authorized to do this!\"}");
                        })
                )
        // TẠM COMMENT để không check token nữa
        // .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
        ;

        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}