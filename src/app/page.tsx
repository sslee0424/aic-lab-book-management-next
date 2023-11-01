"use client";
import Papa from "papaparse";
import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/library';

const TARGETURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRU5hdzkntwQGD8AbxGZ9bgfYIoep9GxVx3RXYyJS4QJYG6GX9NKXGQomZE5lY4Xny8JiKPG55mGcS2/pub?output=csv";


interface SheetType {
  id: number | string;
  barcode: string;
  name: string;
}

export default function Sheet() {
  const [bookList, setBookData] = useState<SheetType[]>([]);
  
const [localStream, setLocalStream] = useState<MediaStream>();
const Camera = useRef<HTMLVideoElement>(null);
const hints = new Map();
const formats = [BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX, BarcodeFormat.CODE_128, BarcodeFormat.CODABAR, BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.CODE_39, BarcodeFormat.CODE_93];
hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
const Scan = new BrowserMultiFormatReader(hints, 500);
const [barcodeValue, setBarcodeValue] = useState('');
const [bookName, setbookName] = useState('')

useEffect(() => {
  Papa.parse<SheetType>(TARGETURL, {
    download: true,
    header: true,
    complete: (results) => {
      setBookData(results.data);
      console.log("results.data", results);
    },
  });
}, []);

useEffect(() => {
 navigator.mediaDevices.getUserMedia({
  //  video: { facingMode: "user" }, //전면 카메라
   video: { facingMode: { exact: "environment" } }, //후면 카메라
 })
   .then(stream => {
     console.log(stream);
     setLocalStream(stream);
   })
 return () => {
   Stop();
 }
}, []);
useEffect(() => {
 if (!Camera.current)
   return;
 if (localStream && Camera.current) {
  console.log("scan start");
   Scanning();
 }
 return () => {
   Stop();
 }
}, [localStream]);
const req = useRef<any>();
const Scanning = () => {
//  const t = await Scan.decodeOnce();
 console.log('scan');
 if (localStream && Camera.current) {
  console.log('scan true');
   try {
     const scanData = Scan.decodeFromStream(localStream, Camera.current, (data, err) => {
       if (data) {
          setBarcodeValue(data.getText());
          // Scan.stopContinuousDecode();
          
          for (var i = 0; i < bookList.length; i++) {
            if (bookList[i].barcode == data.getText()) {
              console.log('FindBook() name: ' + (bookList[i].name));
              setbookName(bookList[i].name);
            }
          }
       } else {
        //  setText("");
       }
     });
   } catch (error) {
     console.log(error);
   }
 }
}
const Stop = () => {
 if (localStream) {
   const vidTrack = localStream.getVideoTracks();
   vidTrack.forEach(track => {
     localStream.removeTrack(track);
   });
 }
}

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
    <div>
    <video id="video" ref={Camera} />
      <input type="text" defaultValue={barcodeValue}/><br />
      <input type="text" defaultValue={bookName} />
    </div>
    </main>
  );
}

  // return (
  //   <main className="flex min-h-screen flex-col items-center justify-between p-24">
  //     <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
  //       <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
  //         Get started by editing&nbsp;
  //         <code className="font-mono font-bold">src/app/page.tsx</code>
  //       </p>
  //       <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
  //         <a
  //           className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
  //           href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
  //           target="_blank"
  //           rel="noopener noreferrer"
  //         >
  //           By{' '}
  //           <Image
  //             src="/vercel.svg"
  //             alt="Vercel Logo"
  //             className="dark:invert"
  //             width={100}
  //             height={24}
  //             priority
  //           />
  //         </a>
  //       </div>
  //     </div>

  //     <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
  //       <Image
  //         className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
  //         src="/next.svg"
  //         alt="Next.js Logo"
  //         width={180}
  //         height={37}
  //         priority
  //       />
  //     </div>

  //     <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
  //       <a
  //         href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
  //         className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
  //         target="_blank"
  //         rel="noopener noreferrer"
  //       >
  //         <h2 className={`mb-3 text-2xl font-semibold`}>
  //           Docs{' '}
  //           <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
  //             -&gt;
  //           </span>
  //         </h2>
  //         <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
  //           Find in-depth information about Next.js features and API.
  //         </p>
  //       </a>

  //       <a
  //         href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
  //         className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
  //         target="_blank"
  //         rel="noopener noreferrer"
  //       >
  //         <h2 className={`mb-3 text-2xl font-semibold`}>
  //           Learn{' '}
  //           <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
  //             -&gt;
  //           </span>
  //         </h2>
  //         <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
  //           Learn about Next.js in an interactive course with&nbsp;quizzes!
  //         </p>
  //       </a>

  //       <a
  //         href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
  //         className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
  //         target="_blank"
  //         rel="noopener noreferrer"
  //       >
  //         <h2 className={`mb-3 text-2xl font-semibold`}>
  //           Templates{' '}
  //           <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
  //             -&gt;
  //           </span>
  //         </h2>
  //         <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
  //           Explore the Next.js 13 playground.
  //         </p>
  //       </a>

  //       <a
  //         href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
  //         className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
  //         target="_blank"
  //         rel="noopener noreferrer"
  //       >
  //         <h2 className={`mb-3 text-2xl font-semibold`}>
  //           Deploy{' '}
  //           <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
  //             -&gt;
  //           </span>
  //         </h2>
  //         <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
  //           Instantly deploy your Next.js site to a shareable URL with Vercel.
  //         </p>
  //       </a>
  //     </div>
  //   </main>
  // )
