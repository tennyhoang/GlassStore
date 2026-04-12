package org.group5.springmvcweb.glassesweb;

import org.group5.springmvcweb.glassesweb.DTO.AuthResponse;
import org.group5.springmvcweb.glassesweb.DTO.LoginRequest;
import org.group5.springmvcweb.glassesweb.DTO.RegisterRequest;
import org.group5.springmvcweb.glassesweb.Entity.Account;
import org.group5.springmvcweb.glassesweb.Entity.Customer;
import org.group5.springmvcweb.glassesweb.Repository.AccountRepository;
import org.group5.springmvcweb.glassesweb.Repository.CustomerRepository;
import org.group5.springmvcweb.glassesweb.Service.AuthService;
import org.group5.springmvcweb.glassesweb.security.JwtUtil;
import org.group5.springmvcweb.glassesweb.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit test cho AuthService.
 *
 * Dùng Mockito để mock tất cả dependencies —
 * test chỉ kiểm tra logic trong AuthService, không cần DB hay Spring context.
 *
 * Cách chạy: mvn test -Dtest=AuthServiceTest
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService — Unit Tests")
class AuthServiceTest {

    // ── Mocks ──────────────────────────────────────────────────────────────────
    @Mock private AccountRepository  accountRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private PasswordEncoder    passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtUtil            jwtUtil;

    // Class under test — Mockito tự inject các @Mock vào đây
    @InjectMocks
    private AuthService authService;

    // ── Fixtures ───────────────────────────────────────────────────────────────
    private Customer sampleCustomer;
    private Account  sampleAccount;

    @BeforeEach
    void setUp() {
        sampleCustomer = Customer.builder()
                .customerId(1)
                .name("Tenny Hoàng")
                .email("ttuan0147@gmail.com")
                .phone("0933346873")
                .status("ACTIVE")
                .build();

        sampleAccount = Account.builder()
                .accountId(1)
                .customer(sampleCustomer)
                .username("tenny")
                .passwordHash("$2a$10$hashedpassword")
                .role("CUSTOMER")
                .build();
    }

    // ── login() ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("login — thành công → trả về AuthResponse với token")
    void login_success_returnsAuthResponse() {
        // Arrange
        LoginRequest request = new LoginRequest("tenny", "password123");

        UserPrincipal principal = UserPrincipal.from(sampleAccount);
        Authentication auth = mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn(principal);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(auth);
        when(jwtUtil.generateToken(principal)).thenReturn("mock.jwt.token");

        // Act
        AuthResponse response = authService.login(request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mock.jwt.token");
        assertThat(response.getTokenType()).isEqualTo("Bearer");
        assertThat(response.getUsername()).isEqualTo("tenny");
        assertThat(response.getRole()).isEqualTo("CUSTOMER");

        // Verify authenticationManager được gọi đúng 1 lần
        verify(authenticationManager, times(1)).authenticate(any());
        verify(jwtUtil, times(1)).generateToken(principal);
    }

    @Test
    @DisplayName("login — sai password → ném BadCredentialsException")
    void login_wrongPassword_throwsBadCredentials() {
        // Arrange
        LoginRequest request = new LoginRequest("tenny", "wrongpassword");
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        // Act & Assert
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class);

        // jwtUtil không được gọi khi auth thất bại
        verifyNoInteractions(jwtUtil);
    }

    // ── register() ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("register — thành công → tạo Customer + Account, trả về AuthResponse")
    void register_success_createsCustomerAndAccount() {
        // Arrange
        RegisterRequest request = RegisterRequest.builder()
                .name("Tenny Hoàng")
                .email("ttuan0147@gmail.com")
                .phone("0933346873")
                .username("tenny")
                .password("password123")
                .build();

        when(accountRepository.existsByUsername("tenny")).thenReturn(false);
        when(customerRepository.existsByEmail("ttuan0147@gmail.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$10$hashed");
        when(customerRepository.save(any(Customer.class))).thenReturn(sampleCustomer);
        when(accountRepository.save(any(Account.class))).thenReturn(sampleAccount);
        when(jwtUtil.generateToken(any(UserPrincipal.class))).thenReturn("mock.jwt.token");

        // Act
        AuthResponse response = authService.register(request);

        // Assert
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mock.jwt.token");
        assertThat(response.getUsername()).isEqualTo("tenny");
        assertThat(response.getRole()).isEqualTo("CUSTOMER");

        // Verify Customer và Account đều được save
        verify(customerRepository, times(1)).save(any(Customer.class));
        verify(accountRepository,  times(1)).save(any(Account.class));
        verify(passwordEncoder,    times(1)).encode("password123");
    }

    @Test
    @DisplayName("register — username đã tồn tại → ném RuntimeException")
    void register_duplicateUsername_throwsException() {
        // Arrange
        RegisterRequest request = RegisterRequest.builder()
                .name("Tenny Hoàng")
                .email("ttuan0147@gmail.com")
                .phone("0933346873")
                .username("tenny")
                .password("password123")
                .build();

        when(accountRepository.existsByUsername("tenny")).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Username đã tồn tại");

        // Không có gì được save khi username đã tồn tại
        verifyNoInteractions(customerRepository);
        verifyNoMoreInteractions(accountRepository); // chỉ gọi existsByUsername
    }

    @Test
    @DisplayName("register — email đã tồn tại → ném RuntimeException")
    void register_duplicateEmail_throwsException() {
        // Arrange
        RegisterRequest request = RegisterRequest.builder()
                .name("Tenny Hoàng")
                .email("duplicate@gmail.com")
                .phone("0933346873")
                .username("tenny_new")
                .password("password123")
                .build();

        when(accountRepository.existsByUsername("tenny_new")).thenReturn(false);
        when(customerRepository.existsByEmail("duplicate@gmail.com")).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Email đã được sử dụng");

        verify(accountRepository, never()).save(any());
        verify(customerRepository, never()).save(any());
    }
}
