package org.group5.springmvcweb.glassesweb.Controller.eye;

import org.group5.springmvcweb.glassesweb.Entity.Account;
import org.group5.springmvcweb.glassesweb.Entity.eye.EyeProfile;
import org.group5.springmvcweb.glassesweb.Repository.AccountRepository;
import org.group5.springmvcweb.glassesweb.Service.eye.EyeProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/eye-profiles")
public class EyeProfileController {

    @Autowired
    private EyeProfileService service;

    @Autowired
    private AccountRepository accountRepository;

    private Integer getCurrentCustomerId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("Chưa đăng nhập");
        }
        String username = auth.getName();
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));
        return account.getCustomerId();
    }

    @PostMapping
    public ResponseEntity<EyeProfile> create(@RequestBody EyeProfile eyeProfile) {
        Integer customerId = getCurrentCustomerId();
        EyeProfile created = service.createEyeProfile(eyeProfile, customerId);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<EyeProfile>> getAll() {
        Integer customerId = getCurrentCustomerId();
        return ResponseEntity.ok(service.getAllByCustomer(customerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EyeProfile> getOne(@PathVariable Integer id) {
        Integer customerId = getCurrentCustomerId();
        return ResponseEntity.ok(service.getById(id, customerId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EyeProfile> update(@PathVariable Integer id, @RequestBody EyeProfile updated) {
        Integer customerId = getCurrentCustomerId();
        return ResponseEntity.ok(service.update(id, updated, customerId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        Integer customerId = getCurrentCustomerId();
        service.delete(id, customerId);
        return ResponseEntity.noContent().build();
    }
}