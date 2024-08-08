import {useEffect, useState} from 'react';
import {listen} from '@tauri-apps/api/event'
import {allExpanded, defaultStyles, JsonView} from 'react-json-view-lite';
import 'react-json-view-lite/dist/index.css';
import {EnzymeMLState, exportToJSON, getState, newEntry, saveEntry} from "../commands/dataio.ts";
import {Button} from "antd";

export default function Home() {

    // States
    const [currentDoc, setCurrentDoc] = useState<EnzymeMLState | null>(null);

    // Effects
    useEffect(() => {
        getState().then(
            (state) => {
                setCurrentDoc(state);
            })
            .catch((error) => {
                console.error('Error:', error);
            });

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
                console.log('Entry saved');
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    const handleNewEntry = () => {
        newEntry().then(
            () => {
                console.log('New entry created');
            }
        )
    }

    const handleDownload = () => {
        exportToJSON().then(
            (response) => {
                console.log('Downloaded:', response);
            }
        )
    }

    return (
        <div>
            <div style={
                {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                }
            }>
                <h1 className={"text-2xl font-bold"}>{currentDoc?.title}</h1>
                <div className={"flex flex-row gap-2"}>
                    <Button onClick={handleSaveEntry}>Save Entry</Button>
                    <Button onClick={handleNewEntry}>New Entry</Button>
                    <Button onClick={handleDownload}>Download</Button>
                </div>
                <JsonView data={currentDoc?.doc} shouldExpandNode={allExpanded} style={defaultStyles}/>
            </div>
        </div>
    );
}