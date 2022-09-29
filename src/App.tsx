// ./src/App.tsx

import React, {useEffect, useState} from 'react';
import Path from 'path';
import uploadFileToBlob, {isStorageConfigured} from './azure-storage-blob';
import {progressService} from "./services/progress.service";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

 
const storageConfigured = isStorageConfigured();

const App = (): JSX.Element => {
  // all blobs in container
  const [blobList, setBlobList] = useState<string[]>([]);

  // current file to upload into container
  const [fileSelected, setFileSelected] = useState(null);

  // UI/form management
  const [uploading, setUploading] = useState(false);
  const [inputKey, setInputKey] = useState(Math.random().toString(36));

  const [progressBar, setProgressBar] = useState(0);

  const [startDate, setStartDate] = useState(new Date());

  const [tipologia, setTipologia] = useState("ACCONTO");

  const [cliente, setCliente] = useState("ENEL");

    useEffect(() => {
        // subscribe to home component messages
        const subscription = progressService.onProgressBar().subscribe(
            (progressBar: any) => {
                setProgressBar(progressBar);
            });

        // return unsubscribe method to execute when component unmounts
        return subscription.unsubscribe;
    }, []);

    useEffect(() => {
        // getContainer();
    }, []);

  const onFileChange = (event: any) => {
    // capture file into state
    setFileSelected(event.target.files[0]);
  };

  const onTipologiaChange = (event: any) => {
    setTipologia(event.target.value);
  };

  const onClienteChange = (event: any) => {
    setCliente(event.target.value);
  };

  const onFileUpload = async () => {
    // prepare UI
    setUploading(true);

    // *** UPLOAD TO AZURE STORAGE ***
    const blobsInContainer: string[] = await uploadFileToBlob(fileSelected, startDate, tipologia, cliente);

    // prepare UI for results
    setBlobList(blobsInContainer);

    // reset state/form
    setFileSelected(null);
    setUploading(false);
    setInputKey(Math.random().toString(36));
  };

 

  // display form
  const DisplayForm = () => (
    <div>
      <div>
        Anno/Mese:
        <DatePicker
            selected={startDate}
            onChange={(date: any) => setStartDate(date)}
            dateFormat="yyyy/MM"
            showMonthYearPicker
        />
      </div>
      <br/>
      <div>
        Tipologia:<br/>
        <select value={tipologia} onChange={onTipologiaChange}>
          <option value="ACCONTO">ACCONTO</option>
          <option value="SAM2">SAM2</option>
          <option value="SAM1">SAM1</option>
        </select>
      </div>
      <br/>
      <div>
        Cliente:<br/>
        <select value={cliente} onChange={onClienteChange}>
          <option value="ENEL">ENEL</option>
          <option value="ACEA">ACEA</option>
        </select>
      </div>
      <br/>
      <input type="file" onChange={onFileChange} key={inputKey || ''} />
      <button type="submit" onClick={onFileUpload} disabled={!(fileSelected && startDate && tipologia && cliente)}>
        Upload!
          </button>
    </div>
  )

  // display file name and image
  const DisplayImagesFromContainer = () => (
    <div>
      <h2>File presenti:</h2>
      <ul>
        {blobList.map((item) => {
          return (
            <li key={item}>
              <div>
                {Path.basename(item)}
                <br />
                  {/*<img src={item} alt={item} height="200" />*/}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div>
      <h1>Metering Distributore Test Upload</h1>
      {storageConfigured && !uploading && DisplayForm()}
      {storageConfigured && uploading && <div>Uploading</div>}
        {!!progressBar &&
            <div>
                <progress id="file" value={progressBar} max="100"> {progressBar}% </progress> {progressBar.toFixed()}%
            </div>
        }
      <hr />
      {storageConfigured && blobList.length > 0 && DisplayImagesFromContainer()}
      {!storageConfigured && <div>Storage is not configured.</div>}
    </div>
  );
};

export default App;


