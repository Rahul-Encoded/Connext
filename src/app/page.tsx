//By default every component is a server component by default

import CreatePost from "@/components/CreatePost";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  
  const user = await currentUser();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:colspan-6">
        {user ? <CreatePost></CreatePost> : null}
      </div>

      <div className="hidden lg:block lg:col-span-4 sticky top-20">
        Who to follow?
      </div>
    </div>
  );
}
