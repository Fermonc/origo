
'use client';

        .fab {
  width: 50px;
  height: 50px;
  border - radius: 50 %;
  background: white;
  border: none;
  box - shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  font - size: 1.5rem;
  display: flex;
  align - items: center;
  justify - content: center;
  cursor: pointer;
  transition: transform 0.2s;
  position: relative;
}

        .fab:active {
  transform: scale(0.95);
}

        .list - fab {
  background: var(--color - primary);
  color: white;
}

        .fab - badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: var(--color - secondary);
  color: white;
  font - size: 0.7rem;
  font - weight: 700;
  width: 20px;
  height: 20px;
  border - radius: 50 %;
  display: flex;
  align - items: center;
  justify - content: center;
  border: 2px solid white;
}
`}</style>
    </div>
  );
}
