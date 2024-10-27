import { useEffect, useState } from 'react'
import './index.css'
import * as XLSX from 'xlsx';
import { Modal, Popover } from "flowbite-react";
import React from 'react';
import { GiWhiteBook } from 'react-icons/gi';
import { TbListLetters } from 'react-icons/tb';
import { BiSolidBookAdd } from 'react-icons/bi';
import { IoIosSearch } from 'react-icons/io';
import Tooltip from '@mui/material/Tooltip';
import { FixedSizeGrid as Grid } from 'react-window';

function App() {

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
		const chunkedArray = chunkArray(words, 5); // Change 5 to the desired chunk size
		const Cell = ({ columnIndex, rowIndex, style }: any) => (
			<div style={style}>
				{chunkedArray[rowIndex][columnIndex]?.word ?
					<div className='p-3 flex justify-center items-center'>
						<div className="cursor-pointer bg-white border p-4 rounded-lg border-black w-full h-full" onClick={() => { setOpenModal(true); setModalValues(chunkedArray[rowIndex][columnIndex]) }}>
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
					columnCount={5}
					columnWidth={(window.innerWidth - 20) / 5}
					height={window.innerHeight - 130}
					rowCount={chunkedArray?.length || 0}
					rowHeight={70}
					width={window.innerWidth - 10}
				>
					{Cell}
				</Grid>
				<Modal dismissible show={openModal} onClose={() => setOpenModal(false)}>
					<Modal.Header>{modalValues?.word}</Modal.Header>
					<Modal.Body>
						<div className="space-y-6 whitespace-pre-wrap">
							{modalValues?.meaning}
						</div>
					</Modal.Body>
				</Modal>
			</div>
		)
	}


	return (
		<div className="font-tahoma h-screen w-screen overflow-x-hidden overflow-y-auto scrollbar" style={{ backgroundColor: bgColor }}>
			<div className="w-full h-fit flex flex-col justify-center items-center pt-3 sticky top-0 z-10">
				<div className={`transition-all w-fit h-fit mt-2 bg-white rounded-lg shadow-md text-sm`}>
					<div className="relative flex items-center justify-center gap-2 p-1 w-fit px-2" style={{ color: secondaryTextColor }}>
						<div className={`absolute transition-all duration-300 rounded-lg ${currentPage === 0 ? 'left-0 w-1/3 bg-[#212529]' : currentPage === 1 ? 'left-1/3 w-1/3 bg-[#212529]' : 'left-2/3 w-1/3 bg-[#212529]'}`} style={{ height: '100%' }} />
						<div className={`p-1 px-2  transition-all cursor-pointer relative z-10 w-[130px] ${currentPage === 0 ? 'text-white' : 'text-black hover:scale-[1.1]'} flex items-center justify-center gap-2`} onClick={() => setCurrentPage(0)}>
							<GiWhiteBook />
							<div className="">Story Vault</div>
						</div>
						<div className={`p-1 px-2 transition-all cursor-pointer relative z-10 w-[130px] ${currentPage === 1 ? 'text-white' : 'text-black hover:scale-[1.1]'} flex items-center justify-center gap-2`} onClick={() => setCurrentPage(1)}>
							<BiSolidBookAdd />
							<div className="">Add Story</div>
						</div>
						<div className={`p-1 px-2 transition-all cursor-pointer relative z-10 w-[130px] ${currentPage === 2 ? 'text-white' : 'text-black hover:scale-[1.1]'} flex items-center justify-center gap-2`} onClick={() => setCurrentPage(2)}>
							<TbListLetters />
							<div className="">Saved Words</div>
						</div>
					</div>
				</div>
				<div className={`transition-all ${currentPage === 1 ? 'w-fit h-fit mt-2 bg-white rounded-lg shadow-md text-sm' : 'w-0 h-0 overflow-hidden'}`}>
					<div className="relative flex items-center justify-center gap-2 p-1 w-fit px-2" style={{ color: secondaryTextColor }}>
						<div className={`absolute transition-all duration-300 rounded-lg ${isEdit ? 'left-0 w-1/2 bg-[#212529]' : 'left-1/2 w-1/2 bg-[#212529]'}`} style={{ height: '100%' }} />
						<div className={`p-1 px-2  transition-all cursor-pointer relative z-10 w-1/2 ${isEdit ? 'text-white' : 'text-black hover:scale-[1.1]'} flex items-center justify-center`} onClick={() => setIsEdit(true)}>Edit</div>
						<div className={`p-1 px-2 transition-all cursor-pointer relative z-10 w-1/2 ${!isEdit ? 'text-white' : 'text-black hover:scale-[1.1]'} flex items-center`} onClick={() => setIsEdit(false)}>Preview</div>
					</div>
				</div>
			</div>
			<div className={`fixed top-0 left-0 transition-all flex items-center justify-center ${currentPage === 0 ? 'h-full w-[260px]' : 'h-full w-0 opacity-0 overflow-hidden'}`} style={{ backgroundColor: bgColor }}>
				<div className="h-[85%] w-full pr-[10px] pl-[5px] border-r border-[#ADB5BD] overflow-y-auto scrollbar-hidden">
					<div className="sticky top-0 p-1 relative" style={{ backgroundColor: bgColor }}>
						<input type="text" className="border-gray-300 bg-gray-50 text-gray-900 focus:border-gray-300 focus:outline-none focus:ring-0 w-full p-2 pl-8 border rounded" placeholder='Search' value={searchStories} onChange={(e) => setSearchStories(e.target.value)} />
						<IoIosSearch className='absolute h-5 w-5 top-0 mt-3.5 ml-2' />
					</div>
					{storiesData?.filter((item: any) => item?.Name?.toLowerCase()?.includes(searchStories.toLowerCase())).length > 0 ? '' : <div className="w-full pt-5 text-center text-[#495057]">No results found</div>}
					{storiesData?.map((item: any) => {
						if (item?.Name?.toLowerCase()?.includes(searchStories.toLowerCase())) {
							return (
								<Tooltip title={item?.Name} arrow placement='right'>
									<div className={`py-1 px-2 truncate m-1 cursor-pointer transition-all rounded-md ${selectedStory === item ? 'bg-[#ADB5BD]' : 'hover:bg-[#495057] hover:text-[#F8F9FA]'}`} onClick={() => setSelectedStory(item)}>{item?.Name}</div>
								</Tooltip>
							)
						}
					})}
				</div>
			</div>
			<div className={`${currentPage === 0 ? 'pl-[250px] w-full h-fit' : 'w-0 h-0 opacity-0 overflow-hidden'}`}>
				<div className={`w-full h-fit whitespace-pre-line p-10`}>
					<CustomText text={selectedStory?.Story} wordMeaning={wordMeaning} />
				</div>
			</div>

			<div className={`relative ${currentPage === 1 ? 'h-[calc(100%-100px)] w-full p-5 overflow-hidden' : 'w-0 h-0 opacity-0 overflow-hidden'}`}>
				{isEdit ?
					<textarea placeholder='Add Story' className="w-full h-full bg-white rounded-lg border border-black resize-none p-3 focus:outline-none focus:ring-0 focus:border-black overflow-y-auto scrollbar" value={inputStory} onChange={(e) => setInputStory(e.target.value)} />
					:
					<div className={`w-full h-full p-5 overflow-y-auto scrollbar bg-white rounded-lg border border-black whitespace-pre-line`}>
						{inputStory ?
							<CustomText text={inputStory} wordMeaning={wordMeaning} />
							:
							<div className='w-full h-full flex items-center justify-center' style={{ color: secondaryTextColor }}>No Data Aviable</div>
						}
					</div>
				}
			</div>

			<div className={`${currentPage === 2 ? 'h-[calc(100%-60px)] w-full overflow-y-auto scrollbar' : 'w-0 h-0 opacity-0 overflow-hidden'}`}>
				<div className="sticky top-1 px-5 py-1 relative" style={{ backgroundColor: bgColor }}>
					<input type="text" className="border-gray-300 bg-white text-gray-900 focus:border-gray-300 focus:outline-none focus:ring-0 w-full p-2 pl-8 border rounded" placeholder='Search' value={searchWords} onChange={(e) => setSearchWords(e.target.value)} />
					<IoIosSearch className='absolute h-5 w-5 top-0 mt-3.5 ml-2' />
				</div>
				<GroupedWords words={savedWords?.filter((item: any) => item?.word?.toLowerCase()?.includes(searchWords.toLowerCase()))?.sort((a: any, b: any) => a?.word?.localeCompare(b?.word))} />
			</div>
		</div>
	)
}

export default App
