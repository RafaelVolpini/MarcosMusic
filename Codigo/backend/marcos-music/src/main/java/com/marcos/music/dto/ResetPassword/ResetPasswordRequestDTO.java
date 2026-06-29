package com.marcos.music.dto.ResetPassword;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordRequestDTO {
    private String email;
    private String verificationCode;
    private String newPassword;
}
