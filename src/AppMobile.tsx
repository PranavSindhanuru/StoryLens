import { useEffect, useState } from 'react'
import './index.css'
import * as XLSX from 'xlsx';
import { Popover } from "flowbite-react";
import React from 'react';
import { GiWhiteBook } from 'react-icons/gi';
import { TbListLetters } from 'react-icons/tb';
import { BiSolidBookAdd } from 'react-icons/bi';
import { IoIosSearch } from 'react-icons/io';
import Tooltip from '@mui/material/Tooltip';
import { FixedSizeGrid as Grid } from 'react-window';

function AppMobile() {

    const [data, setData] = useState<any>({});
    const [storiesData, setStoriesData] = useState<any>([]);
    const [wordMeaning, setWordMeaning] = useState<any>({});
    const [savedWords, setSavedWords] = useState<any>([]);
    const [selectedStory, setSelectedStory] = useState<any>(null);
    const [bgColor] = useState('#F8F9FA');
    // const [textColor, setTextColor] = useState('#212529');
    const [secondaryTextColor] = useState('#6C757D');
    const [currentPage, setCurrentPage] = useState(0);
    const [searchStories, setSearchStories] = useState<any>('');
    const [searchWords, setSearchWords] = useState<any>('');
    const [inputStory, setInputStory] = useState<any>('');
    const [isEdit, setIsEdit] = useState(true);
    const [openSelectStory, setOpenSelectStory] = useState(false);


    useEffect(() => {
        loadExcelFile();
    }, []);

    useEffect(() => {
        if (storiesData.length > 0) {
            setSelectedStory(storiesData[0]);
        }
    }, [storiesData])

    useEffect(() => {
        if (Object.keys(data).length > 0) {
            let tempwordMeaning: any = {}
            let tempSavedWords: any = []
            data?.Main?.map((item: any) => {
                if (item?.ID) {
                    tempSavedWords.push({ word: item.Word, meaning: item.Meaning })
                    tempwordMeaning[item.Word.toLowerCase()] = item.Meaning
                }
            })
            setWordMeaning(tempwordMeaning)
            // setSavedWords(groupWordsByFirstLetter(tempSavedWords))
            setSavedWords(tempSavedWords)

            let temp: any = []
            data?.Stories?.map((item: any) => {
                temp.push({ ...item, Story: item.Story?.replaceAll('\n', '\n\n') })
            })
            setStoriesData(temp)
        }
    }, [data]);


    const loadExcelFile = async () => {
        const response = await fetch(`${import.meta.env.BASE_URL}/Words Master.xlsx`);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = (e: any) => {
            const arrayBuffer = e.target.result;
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const allSheetsData: any = {};
            workbook.SheetNames.forEach(sheetName => {
                const sheet = workbook.Sheets[sheetName];
                const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                const temp = arrayToJson(sheetData[0], sheetData.slice(1));
                allSheetsData[sheetName] = temp;
            });
            setData(allSheetsData);
        };
        reader.readAsArrayBuffer(blob);
    };

    const arrayToJson = (headers: any, data: any) => {
        return data.map((row: any) => {
            const obj: any = {};
            headers.forEach((header: any, index: any) => {
                obj[header] = row[index];
            });
            return obj;
        });
    };

    const CustomText = React.memo(({ text, wordMeaning }: any) => {
        return (
            <span>
                {text
                    ?.replace(/\s+([,.!?])/g, '$1') // Remove extra spaces before punctuation
                    .split(/(\s+)/) // Split the text into words
                    .filter(Boolean) // Filter out empty strings
                    .map((word: any, index: any) => {
                        const cleanedWord = word.toLowerCase().replace(/[.,!?]/g, '');
                        return wordMeaning[cleanedWord] ? (
                            <Popover
                                key={index}
                                trigger="click"
                                content={
                                    <div className='font-tahoma w-[calc(100vw-20px)] md:min-w-[300px] md:max-w-[600px] md:w-fit h-fit max-h-[40vh] overflow-y-auto overflow-x-hidden scrollbar p-5 shadow-md'>
                                        {wordMeaning[cleanedWord]}
                                    </div>
                                }
                            >
                                <span className='font-bold cursor-pointer relative inline-block'>
                                    {word}
                                </span>
                            </Popover>
                        ) : word;
                    })}
            </span>
        );
    })

    function chunkArray(array: any, chunkSize: any) {
        const numberOfChunks = Math.ceil(array.length / chunkSize);

        return Array.from({ length: numberOfChunks }, (_, index) => {
            return array.slice(index * chunkSize, index * chunkSize + chunkSize);
        });
    }

    const GroupedWords = ({ words }: any) => {
        const [openModal, setOpenModal] = useState(false);
        const [modalValues, setModalValues] = useState<any>({});
        const handleBackdropClick = (e: any) => {
            if (e.target === e.currentTarget) {
                setOpenModal(false);
            }
        };
        const chunkedArray = chunkArray(words, 2); // Change 5 to the desired chunk size
        const Cell = ({ columnIndex, rowIndex, style }: any) => (
            <div style={style}>
                {chunkedArray[rowIndex][columnIndex]?.word ?
                    <div className='p-1 flex justify-center items-center text-sm'>
                        <div className="cursor-pointer bg-white border p-2 rounded-lg border-black w-full h-full truncate" onClick={() => { setOpenModal(true); setModalValues(chunkedArray[rowIndex][columnIndex]) }}>
                            {chunkedArray[rowIndex][columnIndex]?.word}
                        </div>
                    </div>
                    :
                    <></>
                }
            </div>
        );

        return (
            <div className="p-1 ml-1">
                <Grid
                    className='scrollbar'
                    columnCount={2}
                    columnWidth={(window.innerWidth - 20) / 2}
                    height={window.innerHeight - 120}
                    rowCount={chunkedArray?.length || 0}
                    rowHeight={50}
                    width={window.innerWidth - 10}
                >
                    {Cell}
                </Grid>
                {openModal && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-2"
                        onClick={handleBackdropClick}
                        role="presentation"
                    >
                        <div
                            className="relative bg-white dark:bg-gray-700 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between p-4 border-b border-gray-200 dark:border-gray-600">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {modalValues.word}
                                </h3>
                                <button
                                    onClick={() => setOpenModal(false)}
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto">
                                <div className="space-y-6 whitespace-pre-wrap">
                                    {modalValues.meaning}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="font-tahoma h-screen w-screen overflow-x-hidden overflow-y-auto text-sm" style={{ backgroundColor: bgColor }}>
            <div className="w-full h-fit flex flex-col justify-center items-center pt-3 sticky top-0 z-[11]">
                <div className={`transition-all w-fit h-fit mt-2 bg-white rounded-lg shadow-md ${window.innerWidth > 400 ? 'scale-[0.8]' : 'scale-[0.7]'} text-sm ${currentPage === 0 ? 'ml-10' : ''}`}>
                    <div className="relative flex items-center justify-end gap-2 p-1 w-fit px-2" style={{ color: secondaryTextColor }}>
                        <div className={`absolute transition-all duration-300 rounded-lg ${currentPage === 0 ? 'left-0 w-1/3 bg-[#212529]' : currentPage === 1 ? 'left-1/3 w-1/3 bg-[#212529]' : 'left-2/3 w-1/3 bg-[#212529]'}`} style={{ height: '100%' }} />
                        <div className={`shrink-0 p-1 px-2  transition-all cursor-pointer relative z-10 w-[120px] ${currentPage === 0 ? 'text-white' : 'text-black hover:scale-[1.1]'} flex items-center justify-center gap-2`} onClick={() => setCurrentPage(0)}>
                            <GiWhiteBook />
                            <div className="">Story Vault</div>
                        </div>
                        <div className={`shrink-0 p-1 px-2 transition-all cursor-pointer relative z-10 w-[120px] ${currentPage === 1 ? 'text-white' : 'text-black hover:scale-[1.1]'} flex items-center justify-center gap-2`} onClick={() => setCurrentPage(1)}>
                            <BiSolidBookAdd />
                            <div className="">Add Story</div>
                        </div>
                        <div className={`shrink-0 p-1 px-2 transition-all cursor-pointer relative z-10 w-[120px] ${currentPage === 2 ? 'text-white' : 'text-black hover:scale-[1.1]'} flex items-center justify-center gap-2`} onClick={() => setCurrentPage(2)}>
                            <TbListLetters />
                            <div className="">Saved Words</div>
                        </div>
                    </div>
                </div>
                <div className={`transition-all ${window.innerWidth > 400 ? 'scale-[0.8]' : 'scale-[0.7]'} ${currentPage === 1 ? 'w-fit h-fit mt-1 bg-white rounded-lg shadow-md text-sm' : 'w-0 h-0 overflow-hidden scale-y-0'}`}>
                    <div className="relative flex items-center justify-center gap-2 p-1 w-fit px-2" style={{ color: secondaryTextColor }}>
                        <div className={`absolute transition-all duration-300 rounded-lg ${isEdit ? 'left-0 w-1/2 bg-[#212529]' : 'left-1/2 w-1/2 bg-[#212529]'}`} style={{ height: '100%' }} />
                        <div className={`p-1 px-2  transition-all cursor-pointer relative z-10 w-1/2 ${isEdit ? 'text-white' : 'text-black hover:scale-[1.1]'} flex items-center justify-center`} onClick={() => setIsEdit(true)}>Edit</div>
                        <div className={`p-1 px-2 transition-all cursor-pointer relative z-10 w-1/2 ${!isEdit ? 'text-white' : 'text-black hover:scale-[1.1]'} flex items-center`} onClick={() => setIsEdit(false)}>Preview</div>
                    </div>
                </div>
            </div>
            <div className={`transition-all ${currentPage === 0 ? 'w-fit h-fit' : 'w-0 h-0 overflow-hidden opacity-0'} ${window.innerWidth > 400 ? '' : 'mt-0.5'} ${window.innerWidth < 330 ? '' : ' ml-4'} flex justify-start items-center fixed top-0 z-[11]`}>
                <div className="bg-[#212529] text-white mt-[1.35rem] ml-2 p-2 rounded-full text-center shadow-md text-xs cursor-pointer" onClick={() => setOpenSelectStory(!openSelectStory)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className={`${window.innerWidth > 400 ? ' w-4 h-4' : ' w-3 h-3'}`}>
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>

                </div>
            </div>
            <div className={`fixed top-0 left-0 transition-all flex items-center justify-center z-10 ${(currentPage === 0 && openSelectStory) ? 'h-full w-[100vw]' : 'h-full w-0 overflow-hidden'}`} style={{ backgroundColor: bgColor }}>
                <div className="h-[85%] w-full pr-[10px] pl-[5px] overflow-y-auto scrollbar-hidden">
                    <div className="sticky top-0 p-1 mt-2 relative" style={{ backgroundColor: bgColor }}>
                        <input type="text" className="border-gray-300 bg-gray-50 text-gray-900 focus:border-gray-300 focus:outline-none focus:ring-0 w-full p-2 pl-8 border rounded text-sm" placeholder='Search' value={searchStories} onChange={(e) => setSearchStories(e.target.value)} />
                        <IoIosSearch className='absolute h-5 w-5 top-0 mt-3.5 ml-2' />
                    </div>
                    {storiesData?.filter((item: any) => item?.Name?.toLowerCase()?.includes(searchStories.toLowerCase())).length > 0 ? '' : <div className="w-full pt-5 text-center text-[#495057]">No results found</div>}
                    {storiesData?.map((item: any) => {
                        if (item?.Name?.toLowerCase()?.includes(searchStories.toLowerCase())) {
                            return (
                                <Tooltip title={item?.Name} arrow placement='bottom'>
                                    <div className={`py-1 px-2 truncate m-1 cursor-pointer transition-all rounded-md ${selectedStory === item ? 'bg-[#ADB5BD]' : 'hover:bg-[#495057] hover:text-[#F8F9FA]'}`} onClick={() => { setSelectedStory(item); setOpenSelectStory(false) }}>{item?.Name}</div>
                                </Tooltip>
                            )
                        }
                    })}
                </div>
            </div>
            <div className={`${currentPage === 0 ? 'w-full h-fit' : 'w-0 h-0 opacity-0 overflow-hidden'}`}>
                <div className={`w-full h-fit whitespace-pre-line mt-2 px-5`}>
                    <CustomText text={selectedStory?.Story} wordMeaning={wordMeaning} />
                    <div className="mt-20"></div>
                </div>
            </div>

            <div className={`relative ${currentPage === 1 ? 'w-full p-3' : 'h-0 opacity-0 overflow-hidden'}`} style={{ height: currentPage === 1 ? window.innerHeight - 150 : 0 }}>
                {isEdit ?
                    <textarea placeholder='Add Story' className="w-full text-sm bg-white rounded-lg border border-black resize-none p-3 focus:outline-none focus:ring-0 focus:border-black overflow-y-auto scrollbar" style={{ height: currentPage === 1 ? window.innerHeight - 150 : 0 }} value={inputStory} onChange={(e) => setInputStory(e.target.value)} />
                    :
                    <div className={`w-full bg-white rounded-lg border border-black whitespace-pre-line p-3 overflow-y-auto scrollbar`} style={{ height: currentPage === 1 ? window.innerHeight - 150 : 0 }}>
                        {inputStory ?
                            <CustomText text={inputStory} wordMeaning={wordMeaning} />
                            :
                            <div className='w-full h-full flex items-center justify-center' style={{ color: secondaryTextColor }}>No Data Aviable</div>
                        }
                    </div>
                }
            </div>

            <div className={`${currentPage === 2 ? 'h-[calc(100%-60px)] w-full overflow-y-auto scrollbar' : 'w-0 h-0 opacity-0 overflow-hidden'}`}>
                <div className="sticky top-1 px-3 py-1 relative" style={{ backgroundColor: bgColor }}>
                    <input type="text" className="border-gray-300 bg-white text-gray-900 focus:border-gray-300 focus:outline-none focus:ring-0 w-full p-2 pl-8 border rounded text-sm" placeholder='Search' value={searchWords} onChange={(e) => setSearchWords(e.target.value)} />
                    <IoIosSearch className='absolute h-5 w-5 top-0 mt-3.5 ml-2' />
                </div>
                {savedWords?.filter((item: any) => item?.word?.toLowerCase()?.includes(searchWords.toLowerCase()))?.length > 0 ?
                    <GroupedWords words={savedWords?.filter((item: any) => item?.word?.toLowerCase()?.includes(searchWords.toLowerCase()))?.sort((a: any, b: any) => a?.word?.localeCompare(b?.word))} />
                    :
                    <div className="w-full pt-5 text-center text-[#495057]">No results found</div>}
            </div>
        </div>
    )
}

export default AppMobile
