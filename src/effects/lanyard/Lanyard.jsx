/* eslint-disable react/no-unknown-property */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';

// replace with your own imports, see the usage snippet for details
import cardGLB from './card-optimized.glb';
import lanyard from './lanyard.png';

import * as THREE from 'three';
import './Lanyard.css';

extend({ MeshLineGeometry, MeshLineMaterial });

// 1x1 transparent pixel — lets useTexture be called unconditionally when a
// front/back image isn't supplied.
const BLANK_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// The card model's front face is UV-mapped to the LEFT half of the texture
// atlas and the back face to the RIGHT half (measured from card.glb). Each
// custom image is composited into its own half so the two faces render
// independently, aspect-preserving (no stretching).
const FRONT_UV_RECT = { x: 0, y: 0, w: 0.5, h: 0.755 };
const BACK_UV_RECT = { x: 0.5, y: 0, w: 0.5, h: 0.757 };

export default function Lanyard({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  frontImage = null,
  frontTitle = null,
  frontSubtitle = null,
  backImage = null,
  backColor = null,
  backFit = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1,
  active = false,
  onReady = null
}) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="lanyard-wrapper">
      <Canvas
        camera={{ position: position, fov: fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={1.8} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band
            isMobile={isMobile}
            frontImage={frontImage}
            frontTitle={frontTitle}
            frontSubtitle={frontSubtitle}
            backImage={backImage}
            backColor={backColor}
            backFit={backFit}
            imageFit={imageFit}
            lanyardImage={lanyardImage}
            lanyardWidth={lanyardWidth}
            active={active}
            onReady={onReady}
          />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={0.65}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={0.9}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={0.75}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={1.5}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}
function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  frontImage = null,
  frontTitle = null,
  frontSubtitle = null,
  backImage = null,
  backColor = null,
  backFit = null,
  imageFit = 'cover',
  lanyardImage = null,
  lanyardWidth = 1,
  active = false,
  onReady = null
}) {
  const band = useRef(),
    fixed = useRef(),
    j1 = useRef(),
    j2 = useRef(),
    j3 = useRef(),
    card = useRef();
  const vec = new THREE.Vector3(),
    ang = new THREE.Vector3(),
    rot = new THREE.Vector3(),
    dir = new THREE.Vector3();
  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: isMobile ? 7 : 4, linearDamping: isMobile ? 7 : 4 };
  const { nodes, materials } = useGLTF(cardGLB);
  const texture = useTexture(lanyardImage || lanyard);
  // useTexture must be called unconditionally; use a blank pixel when an image
  // isn't supplied for a given face, then skip compositing it below.
  const frontTex = useTexture(frontImage || BLANK_PIXEL);
  const backTex = useTexture(backImage || BLANK_PIXEL);

  // Composite the front/back images into the card's texture atlas (front = left
  // half, back = right half). Each image is drawn aspect-preserving (no stretch).
  const cardMap = useMemo(() => {
    const baseMap = materials.base.map;
    if (!frontImage && !backImage) return baseMap;

    const baseImg = baseMap.image;
    const W = baseImg.width;
    const H = baseImg.height;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return baseMap;
    // Keep the original baked atlas for the card edges and any untouched face.
    ctx.drawImage(baseImg, 0, 0, W, H);

    const drawFitted = (img, rect, fitMode = imageFit) => {
      const rx = rect.x * W;
      const ry = rect.y * H;
      const rw = rect.w * W;
      const rh = rect.h * H;
      const pick = fitMode === 'contain' ? Math.min : Math.max;
      const scale = pick(rw / img.width, rh / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = rx + (rw - dw) / 2;
      const dy = ry + (rh - dh) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.clip();
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
    };

    if (frontImage && frontTex.image) {
      if (frontTitle || frontSubtitle) {
        const rx = FRONT_UV_RECT.x * W;
        const ry = FRONT_UV_RECT.y * H;
        const rw = FRONT_UV_RECT.w * W;
        const rh = FRONT_UV_RECT.h * H;
        ctx.save();
        ctx.fillStyle = '#f1eee7';
        ctx.fillRect(rx, ry, rw, rh);
        ctx.restore();
        drawFitted(frontTex.image, {
          x: FRONT_UV_RECT.x + FRONT_UV_RECT.w * 0.14,
          y: FRONT_UV_RECT.y + FRONT_UV_RECT.h * 0.32,
          w: FRONT_UV_RECT.w * 0.82,
          h: FRONT_UV_RECT.h * 0.63
        });
        ctx.save();
        ctx.fillStyle = '#263228';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = `700 ${Math.round(rh * 0.078)}px "Songti SC", "STSong", "Noto Serif CJK SC", serif`;
        ctx.fillText(frontTitle || '', rx + rw * 0.085, ry + rh * 0.105);
        ctx.fillStyle = '#445047';
        ctx.font = `700 ${Math.round(rh * 0.052)}px "Songti SC", "STSong", "Noto Serif CJK SC", serif`;
        ctx.fillText(frontSubtitle || '', rx + rw * 0.085, ry + rh * 0.19);
        ctx.restore();
      } else {
        drawFitted(frontTex.image, FRONT_UV_RECT);
      }
    }
    if (backImage && backTex.image) {
      if (backColor) {
        ctx.save();
        ctx.fillStyle = backColor;
        ctx.fillRect(BACK_UV_RECT.x * W, BACK_UV_RECT.y * H, BACK_UV_RECT.w * W, BACK_UV_RECT.h * H);
        ctx.restore();
      }
      drawFitted(backTex.image, {
        x: BACK_UV_RECT.x + BACK_UV_RECT.w * 0.08,
        y: BACK_UV_RECT.y + BACK_UV_RECT.h * 0.12,
        w: BACK_UV_RECT.w * 0.84,
        h: BACK_UV_RECT.h * 0.76
      }, backFit || imageFit);
    }

    const composite = new THREE.CanvasTexture(canvas);
    composite.colorSpace = THREE.SRGBColorSpace;
    composite.flipY = baseMap.flipY;
    composite.anisotropy = 16;
    composite.needsUpdate = true;
    return composite;
  }, [frontImage, frontTitle, frontSubtitle, backImage, backColor, backFit, imageFit, frontTex, backTex, materials.base.map]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (isMobile) [card, j1, j2, j3].forEach(ref => ref.current?.sleep());
      onReady?.();
    }, isMobile ? 1500 : 0);
    return () => window.clearTimeout(timer);
  }, [isMobile, onReady]);
  useEffect(() => {
    if (!active || isMobile) return undefined;
    const timer = window.setTimeout(() => {
      if (!card.current) return;
      card.current.wakeUp();
      card.current.applyImpulse({ x: -0.22, y: 0.08, z: 0.12 }, true);
      card.current.applyTorqueImpulse({ x: 0.02, y: 0.08, z: -0.04 }, true);
    }, 60);
    return () => window.clearTimeout(timer);
  }, [active, isMobile]);
  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  );
  const [dragged, drag] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const [hovered, hover] = useState(false);
  const pointerStart = useRef(null);
  const flipAnimation = useRef(null);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 0.56]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 0.56]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 0.56]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.5, 0]
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useEffect(() => {
    if (!dragged) return undefined;
    const releaseOutsideCanvas = () => {
      drag(false);
      hover(false);
      pointerStart.current = null;
      document.body.style.cursor = 'auto';
    };
    window.addEventListener('pointerup', releaseOutsideCanvas);
    window.addEventListener('pointercancel', releaseOutsideCanvas);
    return () => {
      window.removeEventListener('pointerup', releaseOutsideCanvas);
      window.removeEventListener('pointercancel', releaseOutsideCanvas);
    };
  }, [dragged]);

  useFrame((state, delta) => {
    if (flipAnimation.current && card.current) {
      const elapsed = performance.now() - flipAnimation.current.startedAt;
      const progress = Math.min(1, elapsed / 420);
      const eased = 1 - Math.pow(1 - progress, 3);
      const rotation = flipAnimation.current.from.clone().slerp(flipAnimation.current.to, eased);
      card.current.setNextKinematicRotation(rotation);
      if (progress === 1) {
        flipAnimation.current = null;
        setFlipping(false);
      }
    }
    if (dragged) {
      const pointerX = isMobile ? THREE.MathUtils.clamp(state.pointer.x, -0.86, 0.86) : state.pointer.x;
      const pointerY = isMobile ? THREE.MathUtils.clamp(state.pointer.y, -0.84, 0.42) : state.pointer.y;
      vec.set(pointerX, pointerY, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      const nextPosition = { x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z };
      if (isMobile) {
        nextPosition.x = THREE.MathUtils.clamp(nextPosition.x, -1.35, 1.35);
        nextPosition.y = THREE.MathUtils.clamp(nextPosition.y, -0.35, 2.25);
        nextPosition.z = THREE.MathUtils.clamp(nextPosition.z, -1.25, 1.25);
      }
      card.current?.setNextKinematicTranslation(nextPosition);
    } else if (isMobile && card.current && !flipping) {
      const currentPosition = card.current.translation();
      const boundedPosition = {
        x: THREE.MathUtils.clamp(currentPosition.x, -1.55, 1.55),
        y: THREE.MathUtils.clamp(currentPosition.y, -0.55, 2.45),
        z: THREE.MathUtils.clamp(currentPosition.z, -1.5, 1.5)
      };
      if (
        boundedPosition.x !== currentPosition.x ||
        boundedPosition.y !== currentPosition.y ||
        boundedPosition.z !== currentPosition.z
      ) {
        card.current.setTranslation(boundedPosition, true);
        const velocity = card.current.linvel();
        card.current.setLinvel({
          x: boundedPosition.x !== currentPosition.x ? 0 : velocity.x,
          y: boundedPosition.y !== currentPosition.y ? 0 : velocity.y,
          z: boundedPosition.z !== currentPosition.z ? 0 : velocity.z
        }, true);
      }
    }
    if (fixed.current) {
      [j1, j2].forEach(ref => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.28, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[0.56, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[0.84, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.12, 0, 0]} ref={card} {...segmentProps} type={dragged || flipping ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={e => {
              e.target.releasePointerCapture(e.pointerId);
              const start = pointerStart.current;
              drag(false);
              if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) < 8 && card.current) {
                const from = new THREE.Quaternion().copy(card.current.rotation());
                const turn = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
                flipAnimation.current = {
                  from,
                  to: from.clone().multiply(turn),
                  startedAt: performance.now()
                };
                setFlipping(true);
              }
              pointerStart.current = null;
            }}
            onPointerDown={e => (
              e.target.setPointerCapture(e.pointerId),
              (pointerStart.current = { x: e.clientX, y: e.clientY }),
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
            )}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={cardMap}
                map-anisotropy={16}
                clearcoat={isMobile ? 0.08 : 0.18}
                clearcoatRoughness={0.52}
                roughness={0.74}
                metalness={0.04}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-1, 1]}
          lineWidth={lanyardWidth}
        />
      </mesh>
    </>
  );
}
