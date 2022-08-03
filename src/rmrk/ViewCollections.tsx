// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useRmrkCollections } from './runtime-api';

export function ViewCollections() {
  const navigate = useNavigate();
  const { queryCollections } = useRmrkCollections();
  const [collections, setCollections] = useReducer((state, collection) => {
    return collection === null ? [] : [...state, ...collection];
  }, []);
  const [observer, setObserver] = useState(null);
  const [scrollEndReached, setScrollEnd] = useState(false);
  const loader = useRef(null);

  useEffect(() => {
    queryCollections().then(x => {
      setCollections(x);
    });
  }, []);

  useEffect(() => {
    observer && observer.disconnect();
    setObserver(
      new IntersectionObserver(entries => {
        if (entries[0].isIntersecting === true) {
          collections.length > 0 &&
            queryCollections(collections.slice(-1)[0].id).then(x => {
              setCollections(x);
            });
        }
      })
    );
  }, [JSON.stringify(collections)]);

  useEffect(() => {
    if (loader.current && observer && observer.observe) {
      observer.observe(loader.current);
    }
  }, [observer]);

  useEffect(() => {
    scrollEndReached && observer && observer.disconnect();
  }, [scrollEndReached]);

  useEffect(() => {
    if (collections.length > 0 && collections.slice(-1)[0].id <= 0) {
      setScrollEnd(true);
    }
    if (collections.length === 0) {
      setScrollEnd(false);
    }
  }, [JSON.stringify(collections)]);

  return (
    <>
      <div className="mb-4 italic">! only shows last 10 collections atm !</div>
      <div className="grid grid-cols-12 gap-4 w-full">
        {collections.map(collection => (
          <div className="col-span-3 " key={collection.id}>
            <div
              onClick={() => navigate(`/rmrk-collection/${collection.id}`)}
              className="w-72 border text-gray-500 dark:border-gray-700 border-gray-200 rounded-xl dark:bg-elevation-1 dark:hover:bg-elevation-2 hover:bg-gray-100 cursor-pointer"
            >
              <div className="flex justify-center text-base dark:text-gray-300 text-gray-500 h-72">
                <img className="p-4" src={collection.imageUrl}></img>
              </div>
              <div className="border-t -md pl-4 pt-4 pb-4 text-gray-500 dark:border-gray-700 border-gray-200 items-center text-base dark:text-gray-300 text-gray-500">
                <div>{collection.description}</div>
                <div className="mt-2 italic">Collection of {collection.nftsCount}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!scrollEndReached && <div className="w-4 h-4" ref={loader} />}
    </>
  );
}
