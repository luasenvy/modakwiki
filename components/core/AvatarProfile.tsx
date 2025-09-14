import { CheckCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const variants = {
  sm: "size-5",
  md: "size-6",
  lg: "size-8",
} as const;

interface AvatarProfileProps {
  profile: {
    name: string;
    image?: string | null;
    email?: string;
    emailVerified?: boolean;
  };
  name?: string;
  size?: keyof typeof variants;
  flatten?: boolean;
}

export function AvatarProfile({ profile, name = "", size = "sm", flatten }: AvatarProfileProps) {
  return (
    <div className="flex items-center space-x-1">
      <Avatar className={cn(variants[size], "rounded-full")}>
        {profile.image && <AvatarImage className="!my-0" src={profile.image} alt={profile.name} />}
        <AvatarFallback className="rounded-full text-xs">
          {profile.name.substring(0, 2)}
        </AvatarFallback>
      </Avatar>

      {size === "sm" ? (
        <p className="!my-0 text-sm">
          {profile.email ? (
            <a
              href={`mailto:${profile.email}`}
              className="text-blue-500 text-xs no-underline hover:underline"
              target="_blank"
              rel="noreferrer noopener"
            >
              {name || profile.name}
            </a>
          ) : (
            <span className="text-muted-foreground">{name || profile.name}</span>
          )}
          {profile.emailVerified && <CheckCircle className="ml-1 inline size-3 text-green-600" />}
        </p>
      ) : flatten ? (
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">{name || profile.name}</span>
          <span className="truncate text-xs">{profile.email}</span>
        </div>
      ) : (
        <div>
          <p className="!my-0 text-sm">
            {name || profile.name}
            {profile.emailVerified && <CheckCircle className="ml-1 inline size-3 text-green-600" />}
          </p>
          <p className="!my-0 text-xs">{profile.email}</p>
        </div>
      )}
    </div>
  );
}
