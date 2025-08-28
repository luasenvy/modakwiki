import { CheckCircle } from "lucide-react";
import { headers } from "next/headers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth } from "@/lib/auth/server";
import { cn } from "@/lib/utils";

export default async function () {
  const { user } = (await auth.api.getSession({ headers: await headers() }))!;

  return (
    <div className="flex h-[calc(100dvh_-_var(--spacing)_*_12)] w-full overflow-auto xl:justify-center">
      <div
        className={cn(
          "max-w-full px-2 pt-8 lg:max-w-3xl xl:w-[calc(100%_-_286px)] xl:max-w-4xl",
          "h-fit break-keep pb-24",
        )}
      >
        <div className="flex space-x-1">
          <Avatar className="h-8 w-8 rounded-full">
            {user.image && <AvatarImage src={user.image} alt={user.name} />}
            <AvatarFallback className="rounded-full">{user.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm">
              {user.name}
              {user.emailVerified && <CheckCircle className="ml-1 inline size-3 text-green-600" />}
            </p>
            <p className="text-xs">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
