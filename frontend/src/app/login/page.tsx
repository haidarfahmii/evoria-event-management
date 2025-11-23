import LoginForm from "@/features/auth/components/LoginForm";
import AuthLayout from "@/features/auth/components/AuthLayout";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your email to sign in to your account"
      linkText="Don't have an account?"
      linkUrl="/register"
      linkLabel="Sign up"
    >
      <LoginForm />
    </AuthLayout>
  );
}
