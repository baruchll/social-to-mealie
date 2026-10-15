import { env } from "@//lib/constants";
import type { recipeResult } from "./types";
import type { MealieSession } from "@/types/next-auth";

export async function postRecipe(recipeData: any, owner?: MealieSession) {
    try {
        const payloadData =
            typeof recipeData === "string"
                ? recipeData
                : JSON.stringify(recipeData);

        const res = await fetch(
            `${env.MEALIE_URL}/api/recipes/create/html-or-json`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${env.MEALIE_API_KEY}`,
                },
                body: JSON.stringify({
                    includeTags: true,
                    data: payloadData,
                }),
                signal: AbortSignal.timeout(120000),
            },
        );

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`${res.status} ${res.statusText} - ${errorText}`);
            throw new Error("Failed to create recipe");
        }
        const body = await res.json();
        console.log("Recipe response:", body);

        // Multi-household: hand the new recipe to the logged-in user's household.
        if (owner) {
            await moveRecipeToOwner(body, owner);
        }
        return body;
    } catch (error: any) {
        if (error.name === "AbortError") {
            console.error(
                "Timeout creating mealie recipe. Report this issue on Mealie GitHub.",
            );
            throw new Error(
                `Timeout creating mealie recipe. Report this issue on Mealie GitHub. Input URL: ${env.MEALIE_URL}`,
            );
        }
        console.error("Error in postRecipe:", error);
        throw new Error(error.message);
    }
}

async function moveRecipeToOwner(slug: string, owner: MealieSession) {
    const res = await fetch(`${env.MEALIE_URL}/api/recipes/${slug}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.MEALIE_API_KEY}`,
        },
        body: JSON.stringify({
            userId: owner.userId,
            householdId: owner.householdId,
        }),
    });
    if (!res.ok) {
        const errorText = await res.text();
        console.error(`Move failed: ${res.status} - ${errorText}`);
        // Don't leave the recipe sitting in the admin's household.
        await fetch(`${env.MEALIE_URL}/api/recipes/${slug}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${env.MEALIE_API_KEY}` },
        }).catch(() => { });
        throw new Error("Failed to assign recipe to your household");
    }
}

export async function getRecipe(recipeSlug: string, groupSlug?: string): Promise<recipeResult> {
    const res = await fetch(`${env.MEALIE_URL}/api/recipes/${recipeSlug}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.MEALIE_API_KEY}`,
        },
    });

    const body = await res.json();
    if (!res.ok) throw new Error("Failed to get recipe");

    return {
        name: body.name,
        description: body.description,
        imageUrl: `${env.EXTERNAL_MEALIE_URL || env.MEALIE_URL}/api/media/recipes/${body.id}/images/original.webp`,
        url: `${env.EXTERNAL_MEALIE_URL || env.MEALIE_URL}/g/${groupSlug || env.MEALIE_GROUP_NAME}/r/${recipeSlug}`,
    };
}
