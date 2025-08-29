import { CheckCircle } from "lucide-react";
import { headers } from "next/headers";
import { Container } from "@/components/core/Container";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth } from "@/lib/auth/server";

export default async function () {
  const { user } = (await auth.api.getSession({ headers: await headers() }))!;

  return (
    <Container className="lg:max-w-3xl xl:max-w-4xl">
      <div className="flex space-x-2">
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
    </Container>
  );
}
