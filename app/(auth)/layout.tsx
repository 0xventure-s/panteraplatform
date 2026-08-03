import { SiteLogo } from "@/components/site-logo";

const AuthLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return ( 
    <div className="paper-grid grid min-h-full place-items-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-7 text-center">
          <SiteLogo className="justify-center" />
          <p className="mt-2 text-sm text-muted-foreground">Tu campus de IA y producto.</p>
        </div>
        {children}
      </div>
    </div>
  );
};
 
export default AuthLayout;
