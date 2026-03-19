package org.group5.springmvcweb.glassesweb.security;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.group5.springmvcweb.glassesweb.Entity.Account;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * UserPrincipal — đối tượng Spring Security lưu trong SecurityContext sau khi login.
 * Controller dùng @AuthenticationPrincipal để lấy ra.
 */
@Getter
@AllArgsConstructor
public class UserPrincipal implements UserDetails {

    private final Integer accountId;
    private final Integer customerId;   // null nếu là STAFF/ADMIN/SHIPPER/OPERATION
    private final String username;
    private final String passwordHash;
    private final String role;          // CUSTOMER, STAFF, ADMIN, OPERATION, SHIPPER

    // -------------------------------------------------------
    // Factory method — tạo từ Account entity
    // -------------------------------------------------------
    public static UserPrincipal from(Account account) {
        Integer customerId = account.getCustomer() != null
                ? account.getCustomer().getCustomerId()
                : null;

        return new UserPrincipal(
                account.getAccountId(),
                customerId,
                account.getUsername(),
                account.getPasswordHash(),
                account.getRole()
        );
    }

    // -------------------------------------------------------
    // UserDetails implementation
    // -------------------------------------------------------
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override public boolean isAccountNonExpired()  { return true; }
    @Override public boolean isAccountNonLocked()   { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled()            { return true; }
}