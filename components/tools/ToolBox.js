import React, { useState, useEffect } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";

export default function ToolBox({ selectedNodes, selectedRelId }) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(1);

  useEffect(() => {
    if (selectedNodes.length === 0 && !selectedRelId) {
      setSelectedTabIndex(1);
    }
  }, [selectedNodes, selectedRelId]);

  return (
    <>
      <TabGroup selectedIndex={selectedTabIndex} onChange={setSelectedTabIndex}>
        <TabList className="flex justify-between divide-x text-gray-700">
          <Tab
            className={clsx(
              "grow p-1",
              {
                "pointer-events-none opacity-40 bg-white text-gray-700":
                  selectedNodes.length === 0 && !selectedRelId,
                "data-[selected]:bg-secondary data-[selected]:text-white":
                  selectedNodes.length > 0 || selectedRelId,
              },
              "data-[hover]:bg-primary data-[hover]:text-white data-[selected]:data-[hover]:bg-secondary data-[selected]:data-[hover]:text-white"
            )}
          >
            樣式
          </Tab>
          <Tab className="grow p-1 data-[selected]:bg-secondary data-[selected]:text-white data-[hover]:bg-primary data-[hover]:text-white data-[selected]:data-[hover]:bg-secondary data-[selected]:data-[hover]:text-white">
            佈景
          </Tab>
          <Tab className="grow p-1 data-[selected]:bg-secondary data-[selected]:text-white data-[hover]:bg-primary data-[hover]:text-white data-[selected]:data-[hover]:bg-secondary data-[selected]:data-[hover]:text-white">
            檔案
          </Tab>
        </TabList>
        <TabPanels className="text-gray-700 text-sm">
          <TabPanel>
            <div>tab1</div>
            <Disclosure as="div" className="p-4 border-t" defaultOpen={true}>
              <DisclosureButton className="group flex w-full items-center">
                <ChevronDownIcon className="-rotate-90 size-5 fill-gray-400 group-data-[hover]:fill-gray-700 group-data-[open]:rotate-0" />
                <span className="font-medium">文字</span>
              </DisclosureButton>
              <DisclosurePanel className="mt-3 mb-1">
                <div>分支</div>
              </DisclosurePanel>
            </Disclosure>
            <Disclosure as="div" className="p-4 border-t" defaultOpen={true}>
              <DisclosureButton className="group flex w-full items-center">
                <ChevronDownIcon className="-rotate-90 size-5 fill-gray-400 group-data-[hover]:fill-gray-700 group-data-[open]:rotate-0" />
                <span className=" font-medium">分支</span>
              </DisclosureButton>
              <DisclosurePanel className="mt-3">
                <div>分支</div>
              </DisclosurePanel>
            </Disclosure>
          </TabPanel>
          <TabPanel>
            <div>tab2</div>
          </TabPanel>
          <TabPanel>
            <div>tab3</div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </>
  );
}
