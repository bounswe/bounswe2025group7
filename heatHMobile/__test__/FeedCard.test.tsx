import React from 'react';
import { render, screen } from '@testing-library/react-native';
import FeedCard from '@/components/feedCard';

const baseFeed = {
  id: 1,
  userId: 1,
  type: 'TEXT' as const,
  text: 'Hello world',
  likeCount: 5,
  commentCount: 2,
  name: 'Jane',
  surname: 'Doe',
  profilePhoto: null,
};

describe('FeedCard', () => {
  it('renders name, time (if provided), text and meta', () => {
    const feed = { ...baseFeed, createdAt: '2024-01-01T10:00:00.000Z' };
    render(<FeedCard feed={feed as any} />);

    expect(screen.getByText('Jane Doe')).toBeTruthy();
    expect(screen.getByText('Hello world')).toBeTruthy();
    expect(screen.getByText(/❤️ 5/)).toBeTruthy();
    expect(screen.getByText(/💬 2/)).toBeTruthy();
    expect(screen.getByText(/#TEXT/)).toBeTruthy();
  });

  it('shows image for IMAGE_AND_TEXT and recipe photo for RECIPE', () => {
    const imageFeed = { ...baseFeed, type: 'IMAGE_AND_TEXT' as const, image: 'http://example.com/img.jpg' };
    const recipeFeed = { ...baseFeed, type: 'RECIPE' as const, recipe: { photo: 'http://example.com/photo.jpg' } };

    const { rerender, toJSON } = render(<FeedCard feed={imageFeed as any} />);
    expect(toJSON()).toMatchSnapshot();

    rerender(<FeedCard feed={recipeFeed as any} />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('falls back to "User" when no name/surname', () => {
    const feed = { ...baseFeed, name: undefined, surname: undefined };
    render(<FeedCard feed={feed as any} />);
    expect(screen.getByText('User')).toBeTruthy();
  });
});


