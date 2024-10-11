// src/components/Modal.tsx

import React, { useEffect, useRef } from 'react';
import './Modal.css';

interface ModalProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (isOpen) {
            dialogRef.current?.showModal();
        } else {
            dialogRef.current?.close();
        }
    }, [isOpen]);

    return (
        <dialog ref={dialogRef} className="modal-dialog" onClose={onClose}>
            <button className="modal-close" onClick={onClose}>X</button>
            <h2>{title}</h2>
            {children}
        </dialog>
    );
};

export default Modal;
