import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Social } from "./social";
import Link from "next/link";
interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
}

export const CardWrapper = ({
  children,
  headerLabel,
  backButtonLabel,
  backButtonHref,
  showSocial,
}: CardWrapperProps) => {
  return (
    <Card className="w-full min-w-[280px] max-w-sm sm:max-w-md lg:max-w-lg mt-6">
      <CardHeader>
        <div className="w-full flex flex-col gap-y-4 items-center justify-center">
          <p className="font-franklin-gothic-medium font-bold text-3xl text-[rgba(36,49,52,255)] mb-6">
            {headerLabel}
          </p>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
      <CardFooter>
        <div className="w-full flex flex-col gap-y-4">
          {showSocial && <Social />}
          <div className="text-center">
            <Link
              href={backButtonHref}
              className="text-sm text-muted-foreground hover:underline"
            >
              {backButtonLabel}
            </Link>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
