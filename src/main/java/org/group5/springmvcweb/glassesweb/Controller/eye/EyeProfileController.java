package org.group5.springmvcweb.glassesweb.Controller.eye;

import org.group5.springmvcweb.glassesweb.DTO.EyeProfileDTO;
import org.group5.springmvcweb.glassesweb.Entity.Account;
import org.group5.springmvcweb.glassesweb.Entity.eye.EyeProfile;
import org.group5.springmvcweb.glassesweb.Repository.AccountRepository;
import org.group5.springmvcweb.glassesweb.Service.eye.EyeProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/eye-profiles")
public class EyeProfileController {

    @Autowired
    private EyeProfileService service;

    @Autowired
    private AccountRepository accountRepository;

    private Integer getCurrentCustomerId() {
//        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
//        if (auth == null || !auth.isAuthenticated()) {
//            throw new RuntimeException("Chưa đăng nhập");
//        }
//        String username = auth.getName();
//        Account account = accountRepository.findByUsername(username)
//                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));
//        return account.getCustomerId();
        return 1;  // Hardcode để test không cần auth
    }

    @PostMapping("/create")
    public ResponseEntity<EyeProfile> create(@RequestBody EyeProfileDTO dto) {
        Integer customerId = getCurrentCustomerId();
        EyeProfile eyeProfile = new EyeProfile();
        eyeProfile.setSource(dto.getSource());
        EyeProfile created = service.createEyeProfile(eyeProfile, customerId);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/list")
    public ResponseEntity<List<EyeProfile>> getAll() {
        Integer customerId = getCurrentCustomerId();
        return ResponseEntity.ok(service.getAllByCustomer(customerId));
    }

    @GetMapping("/detail/{id}")
    public ResponseEntity<EyeProfile> getOne(@PathVariable Integer id) {
        Integer customerId = getCurrentCustomerId();
        return ResponseEntity.ok(service.getById(id, customerId));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<EyeProfile> update(@PathVariable Integer id, @RequestBody EyeProfile updated) {
        Integer customerId = getCurrentCustomerId();
        return ResponseEntity.ok(service.update(id, updated, customerId));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        Integer customerId = getCurrentCustomerId();
        service.delete(id, customerId);
        Map<String,String> response = new HashMap<>();
        response.put("message", "Delete profile successfully");
        return ResponseEntity.ok(response)
    }
}