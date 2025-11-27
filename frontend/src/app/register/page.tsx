import RegisterForm from "@/features/auth/components/RegisterForm";
import AuthLayout from "@/features/auth/components/AuthLayout";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create an account"
      subtitle="Enter your details below to create your account"
      linkText="Already have an account?"
      linkUrl="/login"
      linkLabel="Log in"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
