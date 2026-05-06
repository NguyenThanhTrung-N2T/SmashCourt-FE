import BenefitsLayout from "@/src/features/benefit/components/BenefitsLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <BenefitsLayout>{children}</BenefitsLayout>;
}
