package com.talentmatch.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("http://localhost:*", "http://127.0.0.1:*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationSuccessHandler successHandler() {
        return (req, res, auth) -> {
            boolean admin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            res.sendRedirect(admin ? "/admin/dashboard" : "/");
        };
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, AuthenticationSuccessHandler successHandler) throws Exception {
        http
            .cors(c -> c.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"))
            .authorizeHttpRequests(auth -> auth
                // 1. Authentication & Static Assets (Public)
                .requestMatchers("/api/auth/**", "/api/images/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()

                // 2. Admin Strictly Restricted Endpoints (ROLE_ADMIN)
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/categories/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasRole("ADMIN")

                // 3. Customer Role Restricted Endpoints (ROLE_CUSTOMER)
                .requestMatchers("/api/customer/**").hasRole("CUSTOMER")

                // 4. Freelancer Role Restricted Endpoints (ROLE_FREELANCER)
                .requestMatchers("/api/freelancer/**").hasRole("FREELANCER")

                // 5. Permitted Sync & Action APIs
                .requestMatchers("/api/user/profile", "/api/notifications/**", "/api/proposals/**", "/api/orders/**", "/api/reviews/**", "/api/jobs/*/apply").permitAll()

                // 6. Authenticated User Profile & Banking & Uploads
                .requestMatchers("/api/user/**", "/api/upload/**", "/api/payment/**").authenticated()

                // 6. Public Read-Only APIs (Marketplace Discovery)
                .requestMatchers(HttpMethod.GET, "/api/home/**", "/api/jobs/**", "/api/freelancers/**",
                        "/api/users/**", "/api/disputes/**",
                        "/api/vnpay-transactions/**", "/api/invitations/**", "/api/portfolios/**", "/api/questions/**").permitAll()

                // 7. Interactive Operations Requiring Authentication
                .requestMatchers(HttpMethod.POST, "/api/jobs/**", "/api/disputes/**", "/api/questions/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/jobs/**", "/api/questions/**").authenticated()

                // Legacy Web UI routes (kept for backwards compatibility)
                .requestMatchers("/", "/login", "/register", "/verify", "/forgot-password", "/reset-password",
                        "/css/**", "/js/**", "/images/**", "/error").permitAll()
                .requestMatchers(HttpMethod.GET, "/jobs/**", "/freelancers/**", "/hire", "/projects").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/customer/**").hasRole("CUSTOMER")
                .requestMatchers("/freelancer/**").hasRole("FREELANCER")
                .requestMatchers("/projects/**", "/payment/**").authenticated()
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .defaultAuthenticationEntryPointFor(
                    new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                    request -> request.getRequestURI().startsWith("/api/")
                )
            )
            .formLogin(form -> form
                .loginPage("/login")
                .loginProcessingUrl("/login")
                .usernameParameter("email")
                .passwordParameter("password")
                .successHandler(successHandler)
                .failureUrl("/login?error")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/?logout")
                .permitAll()
            )
            .rememberMe(r -> r
                .key("talentmatch-pro-remember-key")
                .tokenValiditySeconds(7 * 24 * 60 * 60)
            );

        return http.build();
    }
}
