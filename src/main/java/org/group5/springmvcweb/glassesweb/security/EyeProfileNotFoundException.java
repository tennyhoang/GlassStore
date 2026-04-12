package org.group5.springmvcweb.glassesweb.security;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class EyeProfileNotFoundException extends RuntimeException {
    public EyeProfileNotFoundException(Integer id) {
        super("Không tìm thấy hồ sơ mắt với ID: " + id);
    }
}