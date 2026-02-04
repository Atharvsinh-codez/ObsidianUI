'use client';

import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CloudUpload,
  File,
  Globe,
  MapPin,
  FileText,
  Image as ImageIcon,
  Trash
} from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';

const validateFile = (
  file: File,
  accept?: string,
  maxSizeInMB?: number
): { success: boolean; message: string | null } => {
  // Validate file type if accept is specified
  if (accept) {
    const acceptedTypes = accept.split(',').map((type) => type.trim());
    const fileType = file.type;
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    const isValidType = acceptedTypes.some((acceptedType) => {
      if (acceptedType.startsWith('.')) {
        return acceptedType === fileExtension;
      }
      return acceptedType === fileType;
    });

    if (!isValidType) {
      return { success: false, message: 'File type not accepted.' };
    }
  }

  // Validate file size
  if (maxSizeInMB) {
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSizeInMB) {
      return { success: false, message: `File size exceeds ${maxSizeInMB}MB limit.` };
    }
  }

  return { success: true, message: null };
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileType = (file: File): 'image' | 'pdf' | 'text' | 'other' => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type === 'application/pdf') return 'pdf';
  if (file.type.startsWith('text/')) return 'text';
  return 'other';
};

const getFileIcon = (fileType: 'image' | 'pdf' | 'text' | 'other') => {
  switch (fileType) {
    case 'image':
      return <ImageIcon size={24} className="text-white" />;
    case 'pdf':
      return <FileText size={24} className="text-white" />;
    case 'text':
      return <FileText size={24} className="text-white" />;
    default:
      return <File size={24} className="text-white" />;
  }
};

interface IdleProps {
  accept?: string;
  maxSizeInMB?: number;
  onClick: () => void;
  onDrop: (e: React.DragEvent) => void;
  error: string | null;
}

const Idle = ({ accept, maxSizeInMB, onClick, onDrop, error }: IdleProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    onDrop(e);
  };

  return (
    <div
      className={cn(
        `h-full w-full bg-black overflow-hidden relative border-[3px] border-dashed rounded-lg flex flex-col items-center justify-center select-none cursor-pointer transition-colors`,
        isDragOver ? 'border-blue-500 bg-blue-950/20' : 'border-zinc-800 hover:border-zinc-700'
      )}
      onClick={onClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CloudUpload size={40} className="text-blue-500" />
      <p className="text-sm text-zinc-200 font-medium">Upload a file</p>
      <p className="text-xs mt-2 text-zinc-400">Click to upload or drag and drop</p>
      {accept && (
        <p className="text-xs text-zinc-400">
          Accepts:{' '}
          {accept
            ?.split(',')
            .map((item) => `.${item.split('/').pop()?.trim()}`)
            .join(', ')}
        </p>
      )}
      {maxSizeInMB && <p className="text-xs text-zinc-400">Max size: {maxSizeInMB} MB</p>}
      {error && (
        <motion.p
          animate={{
            x: [0, 2, -2, 2, -2, 0, 2, -2, 2, -2, 0]
          }}
          transition={{
            duration: 0.3,
            delay: 0.15
          }}
          className="text-xs text-red-500 absolute bottom-2"
        >
          {error}
        </motion.p>
      )}

      <AnimatePresence>
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute inset-0 backdrop-blur-sm bg-black/50 z-10 flex items-center justify-center flex-col rounded-xl"
          >
            <MapPin size={32} className="text-blue-100" />
            <p className="text-sm text-blue-100 font-medium">Drop your file here</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Loading = () => {
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [path, setPath] = useState<string>('');
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0
  });

  const gradientCoordinates = {
    x1: ['10%', '110%'],
    x2: ['0%', '100%'],
    y1: ['0%', '0%'],
    y2: ['0%', '0%']
  };

  useEffect(() => {
    const updatePath = () => {
      if (!fromRef.current || !toRef.current || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const fromRect = fromRef.current.getBoundingClientRect();
      const toRect = toRef.current.getBoundingClientRect();

      setContainerSize({ width: containerRect.width, height: containerRect.height });

      const x1 = fromRect.left - containerRect.left + fromRect.width / 2;
      const y1 = fromRect.top - containerRect.top + fromRect.height / 2;
      const x2 = toRect.left - containerRect.left + toRect.width / 2;
      const y2 = toRect.top - containerRect.top + toRect.height / 2;

      const controlY = x1 - 50;
      const d = `M ${x1},${y1} Q ${(x1 + x2) / 2},${controlY} ${x2},${y2}`;
      setPath(d);
    };

    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach(() => {
        updatePath();
      });
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    updatePath();

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="h-full w-full bg-black relative border-[3px] border-zinc-900 rounded-xl flex flex-col items-center justify-center gap-4">
      <div ref={containerRef} className="w-full px-10 flex items-center justify-between relative">
        <motion.span
          animate={{
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          ref={fromRef}
          className="bg-black rounded-full border border-blue-400 p-2 z-10 h-10 w-10 flex items-center justify-center shadow-sm shadow-blue-500"
        >
          <File size={20} strokeWidth={1.5} className="text-zinc-300" />
        </motion.span>
        <motion.span
          animate={{
            scale: [1, 1.05, 1]
          }}
          transition={{
            delay: 0.5,
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          ref={toRef}
          className="bg-black rounded-full border border-blue-400 p-2 z-10 h-10 w-10 flex items-center justify-center shadow-sm shadow-blue-500"
        >
          <Globe size={32} strokeWidth={1.5} className="text-zinc-300" />
        </motion.span>
        <svg
          fill="none"
          width={containerSize.width}
          height={containerSize.height}
          xmlns="http://www.w3.org/2000/svg"
          className={cn('pointer-events-none absolute left-0 top-0 transform-gpu stroke-2')}
          viewBox={`0 0 ${containerSize.width} ${containerSize.height}`}
        >
          <path
            d={path}
            stroke="#3F3F47"
            strokeWidth={1}
            strokeOpacity={0.8}
            strokeLinecap="round"
          />
          <path
            d={path}
            strokeWidth={3}
            stroke={`url(#${'path'})`}
            strokeOpacity="1"
            strokeLinecap="round"
          />
          <defs>
            <motion.linearGradient
              className="transform-gpu"
              id={'path'}
              gradientUnits={'userSpaceOnUse'}
              initial={{
                x1: '0%',
                x2: '0%',
                y1: '0%',
                y2: '0%'
              }}
              animate={{
                x1: gradientCoordinates.x1,
                x2: gradientCoordinates.x2,
                y1: gradientCoordinates.y1,
                y2: gradientCoordinates.y2
              }}
              transition={{
                duration: 1.5,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'loop'
              }}
            >
              <stop stopColor={'#ffffff'} stopOpacity="0"></stop>
              <stop stopColor={'#ffffff'} stopOpacity="0.3"></stop>
              <stop offset="15%" stopColor={'#00bfff'} stopOpacity="1"></stop>
              <stop offset="30%" stopColor={'#0080ff'} stopOpacity="0.8"></stop>
              <stop offset="50%" stopColor={'#0066cc'} stopOpacity="0.6"></stop>
              <stop offset="70%" stopColor={'#004499'} stopOpacity="0.4"></stop>
              <stop offset="85%" stopColor={'#002266'} stopOpacity="0.2"></stop>
              <stop offset="100%" stopColor={'#001133'} stopOpacity="0"></stop>
            </motion.linearGradient>
          </defs>
        </svg>
      </div>
      <p className="text-xs text-zinc-300 font-light">Uploading file...</p>
    </div>
  );
};

const Preview = ({ file }: { file: File }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [previewLoaded, setPreviewLoaded] = useState(false);
  const fileType = getFileType(file);
  const fileIcon = getFileIcon(fileType);

  useEffect(() => {
    if (fileType === 'image') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewLoaded(true);
    }
  }, [file, fileType]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: previewLoaded ? 1 : 0, scale: previewLoaded ? 1 : 0.8 }}
      transition={{ duration: 0.3, ease: 'easeInOut', delay: 0.2 }}
      className="relative w-full h-full rounded-lg overflow-hidden border border-zinc-700 flex items-center justify-center"
    >
      {fileType === 'image' && imagePreview ? (
        <Image
          onLoad={() => setPreviewLoaded(true)}
          src={imagePreview}
          alt="File preview"
          fill
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">{fileIcon}</div>
      )}
    </motion.div>
  );
};

interface SuccessProps {
  files: FileList;
  onRemove: () => void;
}

const Success = ({ files, onRemove }: SuccessProps) => {
  return (
    <div className="h-full w-full bg-black relative border-[3px] border-zinc-900 rounded-xl flex flex-col items-center justify-center gap-4 overflow-hidden">
      <div className="w-full flex-1 flex flex-col items-center justify-center gap-3 relative h-full overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          {files.length === 1 ? (
            <Preview file={files[0]} />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              {Array.from(files)
                .slice(0, 4)
                .map((file, index) => {
                  return (
                    <motion.div
                      key={`file-upload-preview-${index}-${file.name}`}
                      style={{
                        rotateZ: files.length <= 2 ? index * 15 : -(15 - index * 15),
                        x: files.length <= 2 ? index * 10 : index * 15 - 15,
                        y: index * 10
                      }}
                      className="h-3/4 w-3/4 absolute"
                    >
                      <Preview file={file} />
                    </motion.div>
                  );
                })}
            </div>
          )}
        </div>
        <div
          style={{
            // background: 'black',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            maskImage: 'linear-gradient(to bottom, transparent, black 80%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 80%)'
          }}
          className="absolute inset-0"
        />

        <div className="absolute inset-0 flex flex-col items-start justify-end p-3 bg-black/20">
          <div className="flex items-end justify-between w-full">
            <div className="flex flex-col items-start justify-end flex-1">
              <p className="text-sm text-white font-medium line-clamp-1">
                {files.length > 1 ? `${files.length} files` : files[0].name}
              </p>
              <p className="text-xs text-white line-clamp-1">
                {formatFileSize(Array.from(files).reduce((acc, file) => acc + file.size, 0))}
              </p>
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="p-2 rounded-full hover:bg-white/5 group"
            >
              <Trash size={16} className="group-hover:text-red-600/90" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface FileInputProps {
  accept?: string; // e.g. 'image/png, image/jpeg, application/pdf
  maxSizeInMB?: number;
  onFileChange?: (files: FileList) => void | Promise<void>;
  allowMultiple?: boolean;
}

const FileInput = ({
  accept = 'image/png, image/jpeg, application/pdf',
  maxSizeInMB = 10,
  onFileChange,
  allowMultiple = false
}: FileInputProps) => {
  const [state, setState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    let file = e.target.files?.[0];

    if (!file || !files) return;

    for (let i = 0; i < files.length; i++) {
      file = files[i];
      const { success, message } = validateFile(file, accept, maxSizeInMB);
      if (!success) {
        setError(message || 'Something went wrong.');
        return;
      }
    }

    console.log('file', file);

    setState('loading');
    try {
      await onFileChange?.(files);
    } catch (error) {
      console.error(error);
      setState('idle');
      setError('Something went wrong.');
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setFiles(files);
    setState('success');
  };

  const handleDrop = async (e: React.DragEvent) => {
    setError(null);
    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    let file = files[0];

    for (let i = 0; i < files.length; i++) {
      file = files[i];
      const { success, message } = validateFile(file, accept, maxSizeInMB);
      if (!success) {
        setError(message || 'Something went wrong.');
        return;
      }
    }

    console.log('file', file);

    setState('loading');
    try {
      await onFileChange?.(files);
    } catch (error) {
      console.error(error);
      setState('idle');
      setError('Something went wrong.');
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setFiles(files);
    setState('success');
  };

  const handleRemove = () => {
    setFiles(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setState('idle');
  };

  return (
    <div className="w-[300px] h-[200px] relative overflow-hidden">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept={accept}
        onChange={onChange}
        multiple={allowMultiple}
      />
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={state}
          className="h-full w-full overflow-hidden rounded-xl"
          initial={{
            y: state === 'loading' ? '-100%' : '100%',
            filter: 'blur(10px)',
            scale: 1,
            borderRadius: '100%'
          }}
          animate={{ y: 0, filter: 'blur(0px)', scale: 1, borderRadius: '0%' }}
          exit={{
            y: ['loading', 'success'].includes(state) ? '-100%' : '100%',
            filter: 'blur(10px)',
            scale: 0.7,
            borderRadius: '100%'
          }}
          transition={{
            type: 'spring',
            duration: 0.4,
            bounce: 0
          }}
        >
          {state === 'idle' && (
            <Idle
              accept={accept}
              maxSizeInMB={maxSizeInMB}
              onClick={handleFileInputClick}
              onDrop={handleDrop}
              error={error}
            />
          )}
          {state === 'loading' && <Loading />}
          {state === 'success' && files && <Success files={files} onRemove={handleRemove} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FileInput;
