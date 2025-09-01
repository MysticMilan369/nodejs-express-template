// Generic blue color scheme
const BRAND_COLORS = {
  primary: '#2563eb',
  secondary: '#1e40af',
  accent: '#3b82f6',
  white: '#ffffff',
  gray: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    600: '#64748b',
    700: '#334155',
    900: '#0f172a',
  },
};

// Base email template
const createEmailTemplate = (
  title: string,
  content: string,
  buttonText?: string,
  buttonUrl?: string,
  footerText?: string,
): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          background-color: ${BRAND_COLORS.gray[100]}; 
          padding: 20px; 
          line-height: 1.6;
        }
        
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: ${BRAND_COLORS.white};
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .header {
          background: linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.secondary});
          padding: 40px 30px;
          text-align: center;
          color: ${BRAND_COLORS.white};
        }
        
        .logo {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        
        .content {
          padding: 40px 30px;
        }
        
        .content h1 {
          font-size: 24px;
          color: ${BRAND_COLORS.gray[900]};
          margin-bottom: 20px;
        }
        
        .content p {
          font-size: 16px;
          color: ${BRAND_COLORS.gray[700]};
          margin-bottom: 16px;
        }
        
        .button {
          display: inline-block;
          background: linear-gradient(135deg, ${BRAND_COLORS.primary}, ${BRAND_COLORS.accent});
          color: ${BRAND_COLORS.white};
          text-decoration: none;
          padding: 16px 32px;
          border-radius: 8px;
          font-weight: 600;
          margin: 25px 0;
        }
        
        .footer {
          background: ${BRAND_COLORS.gray[50]};
          padding: 30px;
          text-align: center;
          border-top: 1px solid ${BRAND_COLORS.gray[200]};
          font-size: 14px;
          color: ${BRAND_COLORS.gray[600]};
        }
        
        @media (max-width: 600px) {
          .container { border-radius: 0; }
          .header, .content, .footer { padding: 20px; }
          .logo { font-size: 24px; }
          .content h1 { font-size: 20px; }
          .button { display: block; text-align: center; }
        }
      </style>
    </head>
    
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Our Platform</div>
          <p>Connect, Learn, Grow</p>
        </div>
        
        <div class="content">
          <h1>${title}</h1>
          ${content}
          
          ${
            buttonText && buttonUrl
              ? `
            <div style="text-align: center;">
              <a href="${buttonUrl}" class="button">${buttonText}</a>
            </div>
          `
              : ''
          }
        </div>
        
        <div class="footer">
          <p>${footerText || 'Thank you for being part of our community!'}</p>
          <p style="margin-top: 16px; font-size: 12px;">Building connections, one step at a time.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email verification template
export const createVerificationEmailTemplate = (verificationUrl: string): string => {
  const content = `
    <p><strong>Welcome!</strong> Thank you for joining our platform.</p>
    
    <p>To get started, please verify your email address by clicking the button below:</p>
    
    <div style="background: ${BRAND_COLORS.gray[50]}; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <p style="margin: 0; font-size: 14px;">
        <strong>⚡ Quick verification:</strong> This link expires in 24 hours for security.
      </p>
    </div>
    
    <p>Once verified, you'll have access to all platform features.</p>
    
    <p>If you didn't create this account, you can safely ignore this email.</p>
  `;

  return createEmailTemplate(
    'Verify Your Email Address',
    content,
    'Verify My Email',
    verificationUrl,
    "Ready to start your journey? We're excited to have you!",
  );
};

// Welcome email template
export const createWelcomeEmailTemplate = (userName: string, dashboardUrl: string): string => {
  const content = `
    <p><strong>Hello ${userName}!</strong> We're thrilled to have you join our community.</p>
    
    <p>You're now part of an amazing community where you can connect, learn, and grow.</p>
    
    <div style="background: ${BRAND_COLORS.gray[50]}; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h3 style="margin: 0 0 15px 0; color: ${BRAND_COLORS.gray[900]};">🚀 Get Started:</h3>
      <ul style="margin: 0; padding-left: 20px; color: ${BRAND_COLORS.gray[700]};">
        <li style="margin-bottom: 8px;"><strong>📚 Explore Content</strong> - Discover resources and materials</li>
        <li style="margin-bottom: 8px;"><strong>🎓 Access Features</strong> - Use all platform capabilities</li>
        <li style="margin-bottom: 8px;"><strong>🧠 Test Knowledge</strong> - Challenge yourself with content</li>
        <li><strong>🤝 Join Community</strong> - Connect with other members</li>
      </ul>
    </div>
    
    <p>Ready to explore? Start your journey today!</p>
  `;

  return createEmailTemplate(`Welcome ${userName}!`, content, 'Start Exploring', dashboardUrl);
};

// Password reset email template
export const createPasswordResetEmailTemplate = (resetUrl: string): string => {
  const content = `
    <p>We received a request to reset your password.</p>
    
    <p>Click the button below to create a new password:</p>
    
    <div style="background: ${BRAND_COLORS.gray[50]}; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h3 style="margin: 0 0 10px 0; color: ${BRAND_COLORS.gray[900]};">🔒 Security Info:</h3>
      <ul style="margin: 0; padding-left: 20px; color: ${BRAND_COLORS.gray[700]}; font-size: 14px;">
        <li style="margin-bottom: 5px;">Link expires in <strong>1 hour</strong></li>
        <li style="margin-bottom: 5px;">If you didn't request this, ignore this email</li>
        <li>Your current password stays the same until you reset it</li>
      </ul>
    </div>
    
    <p>This link can only be used once for security.</p>
  `;

  return createEmailTemplate(
    'Reset Your Password',
    content,
    'Reset Password',
    resetUrl,
    'Need help? Contact support if you have issues.',
  );
};

// Password reset success template
export const createPasswordResetSuccessTemplate = (loginUrl: string): string => {
  const content = `
    <div style="text-align: center; margin: 20px 0;">
      <div style="display: inline-block; background: #10b981; color: white; padding: 12px 20px; border-radius: 50px; font-weight: 600;">
        ✅ Password Updated Successfully!
      </div>
    </div>
    
    <p>Your password has been updated. You can now sign in with your new password.</p>
    
    <div style="background: ${BRAND_COLORS.gray[50]}; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h3 style="margin: 0 0 10px 0; color: ${BRAND_COLORS.gray[900]};">🛡️ Security Tips:</h3>
      <ul style="margin: 0; padding-left: 20px; color: ${BRAND_COLORS.gray[700]}; font-size: 14px;">
        <li style="margin-bottom: 5px;">Keep your password secure</li>
        <li style="margin-bottom: 5px;">Use a unique password</li>
        <li>Consider using a password manager</li>
      </ul>
    </div>
    
    <p>If you didn't make this change, contact support immediately.</p>
  `;

  return createEmailTemplate(
    'Password Reset Successful!',
    content,
    'Sign In',
    loginUrl,
    'Your account security is important to us.',
  );
};

// Account deactivation template
export const createAccountDeactivationTemplate = (userName: string, loginUrl: string): string => {
  const content = `
    <p>Dear <strong>${userName}</strong>,</p>
    
    <p>Your account has been successfully deactivated.</p>
    
    <div style="background: ${BRAND_COLORS.gray[50]}; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h3 style="margin: 0 0 15px 0; color: ${BRAND_COLORS.gray[900]};">What this means:</h3>
      <ul style="margin: 0; padding-left: 20px; color: ${BRAND_COLORS.gray[700]};">
        <li style="margin-bottom: 8px;">Account temporarily suspended</li>
        <li style="margin-bottom: 8px;">Data safely preserved</li>
        <li style="margin-bottom: 8px;">Reactivate anytime by signing in</li>
        <li>No content will be lost</li>
      </ul>
    </div>
    
    <p>To reactivate, simply sign in with your credentials.</p>
  `;

  return createEmailTemplate(
    'Account Deactivated',
    content,
    'Reactivate Account',
    loginUrl,
    "We're here when you're ready to return.",
  );
};

// Account deletion scheduled template
export const createAccountDeletionTemplate = (
  userName: string,
  deletionDate: Date,
  profileUrl: string,
): string => {
  const formattedDate = deletionDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const content = `
    <p>Dear <strong>${userName}</strong>,</p>
    
    <p>Your account is scheduled for deletion.</p>
    
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0;">
      <h3 style="margin: 0 0 10px 0; color: #92400e;">⚠️ Deletion Date:</h3>
      <p style="margin: 0; font-size: 18px; font-weight: 600; color: #92400e;">${formattedDate}</p>
    </div>
    
    <div style="background: ${BRAND_COLORS.gray[50]}; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h3 style="margin: 0 0 15px 0; color: ${BRAND_COLORS.gray[900]};">Important:</h3>
      <ul style="margin: 0; padding-left: 20px; color: ${BRAND_COLORS.gray[700]};">
        <li style="margin-bottom: 8px;">You can cancel until <strong>${formattedDate}</strong></li>
        <li style="margin-bottom: 8px;">All data will be <strong>permanently removed</strong></li>
        <li style="margin-bottom: 8px;">This <strong>cannot be undone</strong></li>
        <li>Cancel by signing in before deletion</li>
      </ul>
    </div>
    
    <p>To cancel: Sign in → Profile Settings → Cancel Deletion</p>
  `;

  return createEmailTemplate(
    'Account Deletion Scheduled',
    content,
    'Cancel Deletion',
    profileUrl,
    "We hope you'll change your mind.",
  );
};
