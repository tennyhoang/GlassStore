package org.group5.springmvcweb.glassesweb.security;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class EyeProfileAccessDeniedException extends RuntimeException {
    public EyeProfileAccessDeniedException() {
        super("Bạn không có quyền truy cập hồ sơ mắt này");
    }
}