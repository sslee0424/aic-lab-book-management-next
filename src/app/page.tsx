"use client";
import Papa from "papaparse";
import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/library';

const TARGETURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRU5hdzkntwQGD8AbxGZ9bgfYIoep9GxVx3RXYyJS4QJYG6GX9NKXGQomZE5lY4Xny8JiKPG55mGcS2/pub?output=csv";


interface SheetType {
  id: number | string;
  barcode: string;
  bName: string;
  state: string;
  uName: string;
}

export default function Sheet() {
  const [bookList, setBookList] = useState<SheetType[]>([]);
  
const [localStream, setLocalStream] = useState<MediaStream>();
const Camera = useRef<HTMLVideoElement>(null);
const hints = new Map();
const formats = [BarcodeFormat.DATA_MATRIX, BarcodeFormat.CODE_128, BarcodeFormat.CODABAR, BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.CODE_39, BarcodeFormat.CODE_93];
hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
const Scan = new BrowserMultiFormatReader(hints, 500);
const [barcode, setBarcode] = useState('');
const [bookData, setBookData] = useState<SheetType>();

useEffect(() => {
  Papa.parse<SheetType>(TARGETURL, {
    download: true,
    header: true,
    complete: (results) => {
      setBookList(results.data);
      console.log("results.data", results.data);

      navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }, //전면 카메라
      //  video: { facingMode: { exact: "environment" } }, //후면 카메라
      }).then(stream => {
          console.log(stream);
          setLocalStream(stream);
      })
    },
  });
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
        setBarcode(data.getText());
          // Scan.stopContinuousDecode();
          if (bookList.some((book) => book.barcode == data.getText())) {
            bookList.forEach((book) => {
              if (book.barcode == data.getText()) {
                console.log('FindBook() name: ' + (book.bName));
                setBookData(book);
              }
            });
          } else {
            setBookData(undefined);
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
    <p>바코드: {barcode || "-"}</p>
    <p>책이름: {bookData?.bName || "-"}</p>
    <p>상태: {bookData?.state || "-"}</p>
    <p>대여자: {bookData?.uName || "-"}</p>
    </div>
    </main>
  );
}
