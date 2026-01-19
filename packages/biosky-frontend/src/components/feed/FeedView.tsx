import { useEffect, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { loadFeed, loadInitialFeed, switchTab } from "../../store/feedSlice";
import type { FeedTab } from "../../services/types";
import { FeedItem } from "./FeedItem";
import styles from "./FeedView.module.css";

export function FeedView() {
  const dispatch = useAppDispatch();
  const { observations, isLoading, currentTab, hasMore } = useAppSelector(
    (state) => state.feed
  );
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(loadInitialFeed());
  }, [dispatch, currentTab]);

  const handleScroll = useCallback(() => {
    const el = contentRef.current;
    if (!el || isLoading || !hasMore) return;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 200) {
      dispatch(loadFeed());
    }
  }, [dispatch, isLoading, hasMore]);

  const handleTabClick = (tab: FeedTab) => {
    if (tab !== currentTab) {
      dispatch(switchTab(tab));
    }
  };

  return (
    <div className={styles.container}>
      <nav className={styles.tabs}>
        <button
          className={`${styles.tabBtn} ${currentTab === "home" ? styles.active : ""}`}
          onClick={() => handleTabClick("home")}
        >
          Home
        </button>
        <button
          className={`${styles.tabBtn} ${currentTab === "explore" ? styles.active : ""}`}
          onClick={() => handleTabClick("explore")}
        >
          Explore
        </button>
      </nav>
      <div className={styles.content} ref={contentRef} onScroll={handleScroll}>
        <div className={styles.list}>
          {observations.map((obs) => (
            <FeedItem key={obs.uri} observation={obs} />
          ))}
        </div>
        {isLoading && <div className={styles.loading}>Loading...</div>}
        {!isLoading && observations.length === 0 && (
          <div className={styles.empty}>
            No observations yet. Be the first to post!
          </div>
        )}
      </div>
    </div>
  );
}
