import {kv} from "@vercel/kv";
import {Poll} from "@/app/types";
// import {PollVoteForm} from "@/app/form";
import Head from "next/head";
import {Metadata, ResolvingMetadata} from "next";

async function getPoll(id: string): Promise<Poll> {

    console.log("Entered getPoll");
    
    let nullPoll = {
        id: "",
        title: "No poll found",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        votes1: 0,
        votes2: 0,
        votes3: 0,
        votes4: 0,
        created_at: 0,
    };

    try {
        let poll: Poll | null = await kv.hgetall(`poll:${id}`);

        if (!poll) {
            return nullPoll;
        }

        // experiment to override and hardcode button values -cfc
        poll.option1 = "Register";
        poll.option2 = "See location";
        poll.option3 = "Show my ticket";
        poll.option4 = "";

        return poll;
    } catch (error) {
        console.error(error);
        return nullPoll;
    }
}

type Props = {
    params: { id: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
    { params, searchParams }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {

    console.log("Entered generateMetadata");
    
    // read route params
    const id = params.id
    const poll = await getPoll(id)

    const fcMetadata: Record<string, string> = {
        "fc:frame": "vNext",
        "fc:frame:post_url": `${process.env['HOST']}/api/event?id=${id}`,
        "fc:frame:image": `https://i.imgur.com/fKUBgay.png?t=513`,
    };
    [poll.option1, poll.option2, poll.option3, poll.option4].filter(o => o !== "").map((option, index) => {
        fcMetadata[`fc:frame:button:${index + 1}`] = option;
    })


    return {
        title: poll.title,
        openGraph: {
            title: poll.title,
            images: [`/api/image?id=${id}`],
        },
        other: {
            ...fcMetadata,
        },
        metadataBase: new URL(process.env['HOST'] || '')
    }
}
function getMeta(
    poll: Poll
) {
    console.log("Entered getMeta");
    
    // This didn't work for some reason
    return (
        <Head>
            <meta property="og:image" content="" key="test"></meta>
            <meta property="og:title" content="My page title" key="title"/>
        </Head>
    );
}


export default async function Page({params}: { params: {id: string}}) {
    const poll = await getPoll(params.id);
    
    console.log("Entered export");
    console.log(params);


    return(
        <>
            <div className="flex flex-col items-center justify-center min-h-screen py-2">
                <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-20 text-center">
//                    <PollVoteForm poll={poll}/>
                </main>
            </div>
        </>
    );

}
