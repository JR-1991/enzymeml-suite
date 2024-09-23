import React, {useEffect, useState} from 'react';
import {listen} from '@tauri-apps/api/event'
import {allExpanded, defaultStyles, JsonView} from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import {
    DBEntries,
    EnzymeMLState,
    exportToJSON,
    getState,
    listEntries,
    loadJSON,
    newEntry,
    saveEntry
} from "../commands/dataio.ts";
import {Button, Input, Select} from "antd";
import {setTitle} from "../commands/enzmldoc.ts";
import NotificationProvider, {NotificationType} from "../components/NotificationProvider.tsx";
import useAppStore from "../stores/appstore.ts";

export default function Home() {

    // States
    const [currentDoc, setCurrentDoc] = useState<EnzymeMLState | null>(null);
    const [documents, setDocuments] = useState<DBEntries[]>()

    // Actions
    const openNotification = useAppStore(state => state.openNotification);

    // Effects
    useEffect(() => {
        getState().then(
            (state) => {
                setCurrentDoc(state);
            })
            .catch((error) => {
                console.error('Error:', error);
            });

        listEntries().then(
            (data) => {
                setDocuments(data);
            }
        ).catch(
            (error) => {
                console.error('Error:', error);
            }
        )

    }, []);

    useEffect(() => {
        const unlisten = listen('update_document', () => {
            getState().then(
                (state) => {
                    setCurrentDoc(state);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });

            listEntries().then(
                (data) => {
                    setDocuments(data);
                }
            ).catch(
                (error) => {
                    console.error('Error:', error);
                }
            )
        });

        // Clean up the event listener on component unmount
        return () => {
            unlisten.then((fn) => fn());
        };
    }, []);

    // Handlers
    const handleSaveEntry = () => {
        saveEntry()
            .then(() => {
                openNotification('Success', NotificationType.SUCCESS, 'Entry saved successfully.');
            })
            .catch((error) => {
                openNotification('Error', NotificationType.ERROR, error.message);
            });
    }

    const handleNewEntry = () => {
        newEntry().catch(
            (error) => {
                openNotification('Error', NotificationType.ERROR, error.message);
            }
        )
    }

    const handleDownload = () => {
        exportToJSON().catch(
            (error) => {
                openNotification('Error', NotificationType.ERROR, error.message);
            }
        )
    }

    const handleLoadEntry = () => {
        loadJSON()
            .then(() => {
                openNotification('Success', NotificationType.SUCCESS, 'Entry has been loaded.');
            })
            .catch(
                (error) => {
                    openNotification('Error', NotificationType.ERROR, error.message);
                }
            )
    }

    return (
        <NotificationProvider>
            <div className={"h-screen"}
                 style={
                     {
                         display: 'flex',
                         flexDirection: 'column',
                         gap: '10px'
                     }
                 }>
                <Input
                    className="text-2xl font-bold"
                    value={currentDoc?.title || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                />
                <div className={"flex flex-row gap-2"}>
                    <Button onClick={handleNewEntry}>New Entry</Button>
                    <Button onClick={handleSaveEntry}>Save Entry</Button>
                    <Button onClick={handleLoadEntry}>Load Entry</Button>
                    <Button onClick={handleDownload}>Download</Button>
                    <Select placeholder={"Select a document"}
                            options={
                                documents?.map(
                                    ([id, title]) => (
                                        {
                                            label: id,
                                            value: title
                                        }
                                    )
                                )
                            }/>
                </div>
                <div className={"h-screen mt-2"}>
                    <div className={"h-full flex justify-center overflow-auto rounded-2xl scrollbar-hide"}>
                        <div className={"h-full w-[80%]"}
                             style={{
                                 borderRadius: 10,
                                 border: '1px solid #e5e5e5'

                             }}
                        >
                            <JsonView data={currentDoc?.doc}
                                      shouldExpandNode={allExpanded}
                                      style={defaultStyles}/>
                        </div>
                    </div>
                </div>
            </div>
        </NotificationProvider>
    );
}