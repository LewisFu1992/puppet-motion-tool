import React, { useState, useRef } from 'react';
import { Upload, Camera, Download, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const MotionFrameExtractor = () => {
  const [video, setVideo] = useState(null);
  const [frames, setFrames] = useState([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // 处理视频上传
  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const videoUrl = URL.createObjectURL(file);
      setVideo(videoUrl);
      setFrames([]);
      setCurrentFrame(0);
    }
  };

  // 捕获关键帧
  const captureFrame = () => {
    if (!videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const frameData = canvas.toDataURL('image/jpeg');
    const timestamp = video.currentTime;
    
    setFrames([...frames, {
      image: frameData,
      timestamp: timestamp,
      description: '请添加动作描述...',
      notes: ''
    }]);
  };

  // 自动提取关键帧
  const autoExtractFrames = () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const duration = video.duration;
    const frameCount = 8; // 默认提取8个关键帧
    
    const interval = duration / frameCount;
    const newFrames = [];
    
    const extractFrame = (time) => {
      video.currentTime = time;
      
      video.onseeked = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        newFrames.push({
          image: canvas.toDataURL('image/jpeg'),
          timestamp: time,
          description: '请添加动作描述...',
          notes: ''
        });
        
        if (time + interval < duration) {
          extractFrame(time + interval);
        } else {
          setFrames(newFrames);
        }
      };
    };
    
    extractFrame(0);
  };

  // 导出分析结果
  const exportAnalysis = () => {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>皮影戏动作分析报告</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .frame { margin-bottom: 30px; border-bottom: 1px solid #ccc; padding-bottom: 20px; }
            img { max-width: 100%; height: auto; }
            h1 { color: #333; }
            .timestamp { color: #666; }
          </style>
        </head>
        <body>
          <h1>皮影戏动作分析报告</h1>
          <p>导出时间：${new Date().toLocaleString()}</p>
          ${frames.map((frame, index) => `
            <div class="frame">
              <h2>步骤 ${index + 1}</h2>
              <p class="timestamp">时间戳：${frame.timestamp.toFixed(2)} 秒</p>
              <div>
                <strong>动作描述：</strong>
                <p>${frame.description}</p>
              </div>
              <div>
                <strong>注意事项：</strong>
                <p>${frame.notes}</p>
              </div>
              <img src="${frame.image}" alt="步骤${index + 1}关键帧">
            </div>
          `).join('')}
        </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `皮影戏动作分析_${new Date().toISOString().slice(0,10)}.html`;
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

    } catch (error) {
      console.error('导出失败:', error);
      alert('导出过程中出现错误，请重试或联系教师。');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6">皮影戏动作分析工具</h1>

        {/* 视频上传和预览区域 */}
        <div className="mb-6">
          <div className="flex justify-center mb-4">
            {video ? (
              <video
                ref={videoRef}
                src={video}
                controls
                className="max-h-96"
              />
            ) : (
              <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                <label className="cursor-pointer text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <span className="mt-2 text-blue-600">上传视频</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="video/*"
                    onChange={handleVideoUpload}
                  />
                </label>
              </div>
            )}
          </div>
          
          {/* 控制按钮 */}
          {video && (
            <div className="flex justify-center gap-4 mb-4">
              <button
                onClick={captureFrame}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <Camera className="h-5 w-5" />
                捕获当前帧
              </button>
              <button
                onClick={autoExtractFrames}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                自动提取关键帧
              </button>
            </div>
          )}
        </div>

        {/* 帧预览和编辑区域 */}
        {frames.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">关键帧分析</h2>
            
            {/* 当前帧预览 */}
            <div className="mb-6">
              <div className="flex justify-center mb-4">
                <img
                  src={frames[currentFrame].image}
                  alt={`关键帧 ${currentFrame + 1}`}
                  className="max-h-96"
                />
              </div>
              
              {/* 帧导航 */}
              <div className="flex justify-center items-center gap-4 mb-4">
                <button
                  onClick={() => setCurrentFrame(prev => Math.max(0, prev - 1))}
                  disabled={currentFrame === 0}
                  className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <span>帧 {currentFrame + 1} / {frames.length}</span>
                <button
                  onClick={() => setCurrentFrame(prev => Math.min(frames.length - 1, prev + 1))}
                  disabled={currentFrame === frames.length - 1}
                  className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>

              {/* 帧编辑 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">动作描述</label>
                  <textarea
                    value={frames[currentFrame].description}
                    onChange={(e) => {
                      const newFrames = [...frames];
                      newFrames[currentFrame].description = e.target.value;
                      setFrames(newFrames);
                    }}
                    className="w-full p-2 border rounded"
                    rows="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">注意事项</label>
                  <textarea
                    value={frames[currentFrame].notes}
                    onChange={(e) => {
                      const newFrames = [...frames];
                      newFrames[currentFrame].notes = e.target.value;
                      setFrames(newFrames);
                    }}
                    className="w-full p-2 border rounded"
                    rows="2"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={exportAnalysis}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    导出分析
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 隐藏的canvas用于截取帧 */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default MotionFrameExtractor;
