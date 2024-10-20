import { useEffect, useState } from 'react'
import './index.css'
import * as XLSX from 'xlsx';
import { Popover } from "flowbite-react";
import React from 'react';

function App() {

	const [data, setData] = useState<any>({});
	const [mainData, setMainData] = useState<any>([]);
	const [storiesData, setStoriesData] = useState<any>([]);
	const [wordMeaning, setWordMeaning] = useState<any>({});
	const [selectedStory, setSelectedStory] = useState<any>(null);

	const [openNav, setOpenNav] = useState(false);

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
			let temp: any = []
			let tempwordMeaning: any = {}
			data?.Main?.map((item: any) => {
				if (item?.ID) {
					temp.push(item)
					tempwordMeaning[item.Word.toLowerCase()] = item.Meaning
				}
			})
			setWordMeaning(tempwordMeaning)
			setMainData(temp)

			temp = []
			data?.Stories?.map((item: any) => {
				temp.push(item)
			})
			setStoriesData(temp)
		}
	}, [data]);

	const loadExcelFile = async () => {
		const response = await fetch('/Words Master.xlsx');
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

	console.log(window.innerWidth, window.innerHeight);

	const CustomText = ({ children }: any) => {
		return (
			<span>
				{React.Children.map(children, (child) =>
					typeof child === 'string'
						? child
							.replace(/\s+([,.!?])/g, '$1')
							.split(/(\s+)/)
							.filter(Boolean)
							.map((word, index) => (
								wordMeaning[word.toLowerCase()] ?
									<Popover
										trigger="hover"
										content={
											<div className='font-tahoma w-[calc(100vw-20px)] h-fit max-h-[40vh] overflow-y-auto overflow-x-hidden scrollbar p-5 shadow-md'>
												{wordMeaning[word.toLowerCase()]}
											</div>
										}
									>
										<span
											className='font-bold cursor-pointer relative'
											key={index}
										// onMouseEnter={() => onHoverSetSelectedWord(word.trim())}
										// data-popover-target={wordMeaning[word.toLowerCase()] ? 'popover' : ''}
										>
											{word}
										</span>
									</Popover>
									:
									<span className="">
										{word}
									</span>
							))
						: child
				)}
			</span>
		);
	};

	return (
		<div className="h-[100vh] w-[100vw] bg-[#F0F3F4] font-tahoma flex flex-col overflow-x-hidden pt-[50px]">
			{window.innerWidth < 768 ?
				<>
					<div className="border-b border-gray-300 p-3 flex items-center justify-around w-full bg-[#F0F3F4] fixed top-0 z-10 h-[50px]" onClick={() => setOpenNav(!openNav)}>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
							<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
						</svg>
						<div className="w-full flex items-center justify-center">
							<img src="/logo.svg" alt="" className="w-6 h-6 mx-3" />
							<div className="font-semibold">StoryLens</div>
						</div>
					</div>
					{openNav ?
						<>
							<div className="flex-none w-full h-full border-r border-gray-300 overflow-y-auto scrollbar">
								{storiesData?.map((item: any) => (
									<div className={`border w-full h-fit truncate p-2 hover:bg-gray-200 ${selectedStory?.Set === item?.Set ? 'bg-gray-200' : ''} cursor-pointer`} onClick={() => { setSelectedStory(item); setOpenNav(false) }}>{item.Set}</div>
								))}
							</div>
						</>
						:
						<div className={`w-full h-full whitespace-pre-line overflow-y-auto scrollbar p-5`}>
							<CustomText>
								{selectedStory?.Story}
							</CustomText>
						</div>
					}
				</>
				:
				<>
					<div className="border-b border-gray-300 p-3 flex items-center justify-around w-full bg-[#F0F3F4] fixed top-0 z-10 h-[50px]" onClick={() => setOpenNav(!openNav)}>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
							<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
						</svg>
						<div className="w-full flex items-center justify-start ml-10">
							<img src="/logo.svg" alt="" className="w-6 h-6 mx-3" />
							<div className="font-semibold">StoryLens</div>
						</div>
					</div>
					<div className="flex w-full h-full">
						<div className="w-[300px] h-full border-r border-gray-300 overflow-y-auto overflow-x-hidden scrollbar">
							{storiesData?.map((item: any) => (
								<div className={`border w-full h-fit truncate p-2 hover:bg-gray-200 ${selectedStory?.Set === item?.Set ? 'bg-gray-200' : ''} cursor-pointer`} onClick={() => { setSelectedStory(item); setOpenNav(false) }}>{item.Set}</div>
							))}
						</div>
						<div className={`w-full h-full whitespace-pre-line overflow-y-auto overflow-x-hidden scrollbar p-10`}>
							<CustomText>
								{selectedStory?.Story}
							</CustomText>
						</div>
					</div>
				</>
			}
		</div>
	)
}

export default App
