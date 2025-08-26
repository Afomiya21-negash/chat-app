import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/db";
import { withAuth } from "../../../middlewares/auth";

async function putHandler(req: NextRequest, user: any) {


    
}

async function deleteHandler(req: NextRequest, user: any) {


}

export const PUT = withAuth(putHandler);
export const DELETE = withAuth(deleteHandler);
