"use client";
import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  Timestamp,
  addDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { db, auth } from "../../lib/firebaseConfig";
import Loading from "../../components/Loading";
import { v4 as uuidv4 } from "uuid";
import { delay } from "../workArea/page";
import SweetAlert from "../../components/SweetAlert";
import { Context } from "../../components/AuthContext";
import { MdChevronRight, MdAdd, MdChevronLeft } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
});

const formatDateTime = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const formattedDate = dateFormatter.format(date);
  const formattedTime = timeFormatter.format(date);
  const [month, day, year] = formattedDate.split("/");
  return `${year}/${month}/${day}, ${formattedTime}`;
};

export default function Folder() {
  const { user } = useContext(Context);
  const [mindMaps, setMindMaps] = useState([]); //存儲使用者所有心智圖檔案
  const [loading, setLoading] = useState(true); //是否開啟loading page
  const router = useRouter();

  const [page, setPage] = useState(1); //目前頁數
  const [perPage, setPerPage] = useState(15); //每頁顯示的檔案數目
  //計算顯示的檔案索引範圍
  const lastItemIndex = page * perPage;
  const firstItemIndex = lastItemIndex - perPage;
  const currentMindMaps = mindMaps.slice(firstItemIndex, lastItemIndex);
  const pageCount = Math.ceil(mindMaps.length / perPage);
  //更改頁數
  const paginate = (pageNum) => setPage(pageNum);
  //生成分頁按鈕元件
  const pageBtn = (num) => {
    const buttons = [];
    for (let i = 1; i <= num; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => paginate(i)}
          className={`rounded-md w-10 h-10 hover:bg-primary hover:text-white hover:border-0 ${
            page === i
              ? "bg-primary text-white"
              : "bg-white border border-gray-400"
          }`}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < pageCount) {
      setPage(page + 1);
    }
  };
  //當畫面寬度改變時，根據螢幕尺寸動態設定每頁檔案數
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 640) {
        setPerPage(3);
      } else if (window.innerWidth <= 1024) {
        setPerPage(7);
      } else {
        setPerPage(15);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  //刪除相應id的心智圖檔案
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    const delFileAlert = await SweetAlert({
      type: "alert",
      title: "Are you sure?",
      icon: "warning",
      text: "You won't be able to revert this!",
      confirmButtonText: "Yes",
      showCancelButton: true,
      cancelButtonText: "No",
    });
    if (delFileAlert.isConfirmed) {
      try {
        const userId = auth.currentUser.uid;
        await deleteDoc(doc(db, "users", userId, "mindMaps", id));
        setMindMaps((prevMindMaps) =>
          prevMindMaps.filter((mindMap) => mindMap.id !== id)
        );
      } catch (err) {
        SweetAlert({
          type: "toast",
          title: "Failed to delete file!",
          icon: "error",
        });
      }
    }
  };
  //新增並儲存一個初始心智圖新檔案
  const handleAddNewFile = async () => {
    try {
      const userId = auth.currentUser.uid;
      const newMindMapData = {
        rootNode: {
          id: uuidv4(),
          name: "Central Topic",
          bkColor: "#000229",
          pathColor: "#000229",
          outline: { color: "#000229", width: "3px", style: "none" },
          font: {
            family: "Noto Sans TC",
            size: "24px",
            weight: "400",
            color: "#FFFFFF",
          },
          path: {
            width: "3",
            style: "0",
          },
        },
        nodes: [],
        lastSavedAt: Timestamp.now(),
      };
      const docRef = await addDoc(
        collection(db, "users", userId, "mindMaps"),
        newMindMapData
      );
      SweetAlert({
        type: "toast",
        title: `Save new file successfully!`,
        icon: "success",
      });
      router.push(`/workArea/${docRef.id}`); //重導向至該檔案頁面
    } catch (err) {
      SweetAlert({
        type: "toast",
        title: `Save new file failed!`,
        icon: "error",
      });
    }
  };

  //儲存localStorage中的試用檔案
  const saveLocalFile = useCallback(
    async (file) => {
      try {
        const userId = auth.currentUser.uid;
        const docRef = await addDoc(
          collection(db, "users", userId, "mindMaps"),
          file
        );
        SweetAlert({
          type: "toast",
          title: "Save new file successfully!",
          icon: "success",
        });
        router.push(`/workArea/${docRef.id}`);
      } catch (err) {
        SweetAlert({
          type: "toast",
          title: "Save new file failed!",
          icon: "error",
        });
      }
    },
    [router]
  );

  //初始載入時取得firstore中，該使用者的mindMaps
  useEffect(() => {
    const fetchMindMaps = async () => {
      try {
        const userId = auth.currentUser.uid;
        const mindMapsCollection = collection(db, "users", userId, "mindMaps");
        const mindMapsSnapshot = await getDocs(mindMapsCollection);
        let mindMapsList = mindMapsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.rootNode.name,
            lastSavedAt: data.lastSavedAt,
          };
        });

        //按照lastSavedAt進行排序
        mindMapsList = mindMapsList.sort(
          (a, b) => b.lastSavedAt.seconds - a.lastSavedAt.seconds
        );

        setMindMaps(mindMapsList);
      } catch (err) {
        SweetAlert({
          type: "toast",
          title: "Failed to load file!",
          icon: "error",
        });
      } finally {
        await delay(1000);
        setLoading(false);
      }
    };

    fetchMindMaps();
  }, []);

  //檢查localStorage是否有暫存的檔案
  useEffect(() => {
    if (user) {
      //若使用者已登入，取得暫存檔案並儲存
      const savedState = localStorage.getItem("mindMapTest");
      if (savedState) {
        const file = JSON.parse(savedState);
        saveLocalFile(file);
        localStorage.removeItem("mindMapTest");
      }
    }
  }, [user, saveLocalFile]);

  return (
    <section
      className="bg-light/50 h-[calc(100vh-65px)] flex item-start justify-center p-4 md:px-8 md:pt-20 md:pb-32 bg-[70%_70%] sm:bg-center bg-no-repeat"
      style={{
        backgroundImage: "url(/BG-01.jpg)",
      }}
    >
      <div className="w-full">
        <div className="max-w-6xl w-full mx-auto bg-white/80 shadow-xl rounded-xl p-6 md:p-10 flex flex-col justify-between">
          {loading ? (
            <Loading />
          ) : (
            <>
              <div className="grid sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-8">
                <button
                  className="min-h-24 p-2 rounded-lg flex items-center justify-center border border-gray-400 hover:border-gray-700 hover:bg-primary/10 group transition-all duration-200"
                  onClick={handleAddNewFile}
                >
                  <MdAdd
                    size={24}
                    className="text-gray-400 text-3xl group-hover:text-gray-700 transition-all duration-200"
                  />
                </button>

                {currentMindMaps.map((mindMap) => (
                  <div
                    key={mindMap.id}
                    className="min-h-24 p-4 md:pr-8 shadow-md bg-[#17493b] text-white rounded-lg relative cursor-pointer transition-all duration-200 hover:scale-105"
                  >
                    <Link
                      href={`/workArea/${mindMap.id}`}
                      className="flex flex-col justify-between h-full"
                    >
                      <h3 className="text-lg font-semibold truncate">
                        {mindMap.name || "未命名"}
                      </h3>

                      <p className="text-sm truncate">
                        {mindMap.lastSavedAt
                          ? formatDateTime(mindMap.lastSavedAt.seconds)
                          : "未知"}
                      </p>
                    </Link>
                    <button
                      className="absolute top-2 right-2 text-red-500 "
                      onClick={(e) => handleDelete(mindMap.id, e)}
                    >
                      <RiDeleteBinLine size={22} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-4 md:mb-5 mx-auto space-x-4 text-gray-700">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className={`w-10 h-10 bg-white border rounded-md flex justify-center items-center ${
                    page === 1
                      ? "text-gray-300 border-gray-300"
                      : "border-gray-400  hover:bg-primary hover:text-white hover:border-0"
                  }`}
                >
                  <MdChevronLeft size={24} />
                </button>
                {perPage === 15 && pageBtn(pageCount)}
                <button
                  onClick={handleNextPage}
                  disabled={page === pageCount}
                  className={` w-10 h-10 bg-white border rounded-md flex justify-center items-center ${
                    page === pageCount
                      ? "text-gray-300 border-gray-300"
                      : "border-gray-400 hover:bg-primary hover:text-white hover:border-0"
                  }`}
                >
                  <MdChevronRight size={24} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
