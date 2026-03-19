package org.group5.springmvcweb.glassesweb.security;

import lombok.RequiredArgsConstructor;
import org.group5.springmvcweb.glassesweb.Entity.Account;
import org.group5.springmvcweb.glassesweb.Repository.AccountRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * CustomUserDetailsService — Spring Security dùng khi authenticate.
 * Load Account từ DB theo username, trả về UserPrincipal.
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final AccountRepository accountRepository;

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Không tìm thấy tài khoản: " + username));
        return UserPrincipal.from(account);
    }
}