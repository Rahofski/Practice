

export const ReviewItem = ({ review }: { review: { id: string; content: string; author: string } }) => {
  return (
    <div className="review-item">
      <h3>{review.author}</h3>
      <p>{review.content}</p>
      <button onClick={() => alert(`Review ID: ${review.id}`)}>View Details</button>
    </div>
  );
}