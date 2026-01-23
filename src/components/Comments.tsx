import React, { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';

interface Comment {
  id: number;
  text: string;
  x: number;
  y: number;
}

export const Comments: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(true);
  const [isPlacingComment, setIsPlacingComment] = useState(false);

  const handleAddComment = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlacingComment) return;

    const newComment: Comment = {
      id: Date.now(),
      text: '',
      x: e.clientX,
      y: e.clientY,
    };
    setComments([...comments, newComment]);
    setIsPlacingComment(false);
  };

  const handleCommentChange = (id: number, text: string) => {
    setComments(
      comments.map((comment) => (comment.id === id ? { ...comment, text } : comment))
    );
  };

  const handleRemoveComment = (id: number) => {
    setComments(comments.filter((comment) => comment.id !== id));
  };

  return (
    <div>
      <div
        style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 1000 }}
      >
        <button
          onClick={() => setIsPlacingComment(!isPlacingComment)}
          style={{
            marginRight: '10px',
            padding: '10px',
            backgroundColor: isPlacingComment ? '#ccc' : '#fff',
            border: '1px solid #ccc',
            borderRadius: '5px',
          }}
        >
          {isPlacingComment ? 'Cancel' : 'Add Comment'}
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          style={{
            padding: '10px',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '5px',
          }}
        >
          {showComments ? 'Hide Comments' : 'Show Comments'}
        </button>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          cursor: isPlacingComment ? 'crosshair' : 'default',
        }}
        onClick={handleAddComment}
      >
        {showComments &&
          comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                position: 'absolute',
                left: comment.x,
                top: comment.y,
                zIndex: 1001,
              }}
            >
              <div
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  padding: '10px',
                }}
              >
                <textarea
                  value={comment.text}
                  onChange={(e) =>
                    handleCommentChange(comment.id, e.target.value)
                  }
                  placeholder="Add a comment..."
                  style={{ width: '200px', height: '100px' }}
                />
                <button
                  onClick={() => handleRemoveComment(comment.id)}
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
