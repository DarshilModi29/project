import React, { useCallback, useMemo, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'

const baseStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    cursor: 'pointer',
    transition: 'border .3s ease-in-out'
};

const activeStyle = {
    borderColor: '#2196f3'
};

const acceptStyle = {
    borderColor: '#00e676'
};

const rejectStyle = {
    borderColor: '#ff1744'
};

const Dropzone = (props) => {
    const onDrop = useCallback((accFiles) => {
        const images = accFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        }));
        props.setFiles(images);
    }, [props]);

    const {
        getRootProps,
        getInputProps,
        isDragAccept,
        isDragReject,
        isDragActive,
    } = useDropzone({ onDrop });

    const style = useMemo(() => ({
        ...baseStyle,
        ...(isDragAccept ? activeStyle : {}),
        ...(isDragReject ? acceptStyle : {}),
        ...(isDragActive ? rejectStyle : {}),
    }), [
        isDragAccept, isDragActive, isDragReject
    ]);

    const thumbs = props.files.map((file, k) => (
        <div key={k + 1} className='text-center mt-2'>
            <h4>Preview:</h4>
            <img
                src={file.preview ? file.preview : file}
                alt={file.preview}
                height={120}
                width={120}
            />
        </div>
    ));

    useEffect(() => () => {
        props.files.forEach(file => URL.revokeObjectURL(file.preview));
    }, [props.files]);
    return (
        <>
            <div {...getRootProps({ style })} className='mb-3'>
                <input {...getInputProps()} id={props.id} multiple={props.multiple} />
                <p>Drag and drop some files here or click to select files</p>
                <aside>
                    {thumbs}
                </aside>
            </div>
        </>
    )
}

export default Dropzone