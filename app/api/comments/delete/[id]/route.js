import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function DELETE(request, { params }) {
  const { id } = params; // The ID of the comment to delete
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.from("comments").delete().match({ id: id }); // We match the comment's primary key

  // NOTE: We don't need to check if the user is the owner here.
  // The RLS policy we created earlier automatically handles this security check in the database.

  if (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Comment deleted successfully" });
}
