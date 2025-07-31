import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  Button,
  Modal,
  Form,
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Price per kg as a range
const pricePerKg = {
  '토너': { min: 30000, max: 40000 },
  '세럼': { min: 50000, max: 60000 },
  '앰플': { min: 50000, max: 60000 },
  '크림': { min: 60000, max: 70000 },
};

const App = () => {
  const [product, setProduct] = useState(null);
  const [volume, setVolume] = useState(null);
  const [quantity, setQuantity] = useState(null);
  const [estimate, setEstimate] = useState({ min: 0, max: 0 });
  const [unitPrice, setUnitPrice] = useState({ min: 0, max: 0 });
  const [view, setView] = useState('form');
  const [showModal, setShowModal] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', brand: '', email: '' });
  const [isEmailValid, setIsEmailValid] = useState(true);

  const productOptions = ['토너', '세럼', '앰플', '크림'];
  const volumeOptions = ['50ml', '100ml', '150ml'];
  const quantityOptions = [1000, 1500, 3000, 5000];

  useEffect(() => {
    if (volume === '50ml' && quantity === 1000) {
      setQuantity(null);
    }
  }, [volume]);

  const validateEmail = (email) => {
    return /^[^@]+@[^@]+\.[^@]+$/.test(email);
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setIsEmailValid(true); // Reset validation on close
  };

  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));

    if (name === 'email') {
      if (value === '' || validateEmail(value)) {
        setIsEmailValid(true);
      } else {
        setIsEmailValid(false);
      }
    }
  };

  const handleConfirmEstimate = async () => {
    console.log(" handleConfirmEstimate triggered");
    console.log({ product, volume, quantity, userInfo });
    if (product && volume && quantity) {
      const basePriceRange = pricePerKg[product];
      let discount = 1.0;
      if (quantity === 3000) discount = 0.9;
      else if (quantity === 5000) discount = 0.8;

      const discountedPricePerKg = { min: basePriceRange.min * discount, max: basePriceRange.max * discount };
      const weightInKg = parseInt(volume.replace('ml', '')) / 1000;
      const minUnitPrice = discountedPricePerKg.min * weightInKg;
      const maxUnitPrice = discountedPricePerKg.max * weightInKg;
      const minEstimate = minUnitPrice * quantity;
      const maxEstimate = maxUnitPrice * quantity;

      setUnitPrice({ min: minUnitPrice, max: maxUnitPrice });
      setEstimate({ min: minEstimate, max: maxEstimate });

      const dataToSave = {
        name: userInfo.name,
        email: userInfo.email,
        brand: userInfo.brand,
        product,
        volume,
        quantity,
        estimate: { min: minEstimate, max: maxEstimate },
      };

      // Log the data to the browser console for debugging
      console.log('Sending data to API:', dataToSave);

      // Send data to Vercel Serverless Function
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/save-lead`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSave),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log('Data sent to Google Sheet successfully.');
      } catch (error) {
        console.error('Error sending data to Google Sheet:', error);
        alert('데이터 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
      
      handleCloseModal();
      setView('result');
    }
  };

  const handleReset = () => {
    setProduct(null);
    setVolume(null);
    setQuantity(null);
    setUserInfo({ name: '', brand: '', email: '' });
    setView('form');
  };

  const formatPrice = (price) => `${Math.round(price).toLocaleString()}원`;

  const renderForm = () => (
    <>
      <Row className="mb-3">
        <Col><h5>제품군</h5><ToggleButtonGroup type="radio" name="product-options" value={product} onChange={setProduct}>{productOptions.map(p => (<ToggleButton key={p} id={`product-${p}`} value={p} variant="outline-primary">{p}</ToggleButton>))}</ToggleButtonGroup></Col>
      </Row>
      <Row className="mb-3">
        <Col><h5>용량</h5><ToggleButtonGroup type="radio" name="volume-options" value={volume} onChange={setVolume}>{volumeOptions.map(v => (<ToggleButton key={v} id={`volume-${v}`} value={v} variant="outline-primary">{v}</ToggleButton>))}</ToggleButtonGroup></Col>
      </Row>
      <Row className="mb-4">
        <Col>
          <h5>수량</h5>
          {volume === '50ml' && <p style={{ fontSize: '0.9rem', color: '#f0f0f0', marginTop: '-5px', marginBottom: '10px' }}>50ml는 1500개 이상부터 생산 가능합니다.</p>}
          <ToggleButtonGroup type="radio" name="quantity-options" value={quantity} onChange={setQuantity}>{quantityOptions.map(q => (<ToggleButton key={q} id={`quantity-${q}`} value={q} variant="outline-primary" disabled={volume === '50ml' && q === 1000}>{q}개</ToggleButton>))}</ToggleButtonGroup>
        </Col>
      </Row>
      <Row><Col className="d-grid"><Button size="lg" onClick={handleShowModal} disabled={!product || !volume || !quantity}>견적 보기</Button></Col></Row>
    </>
  );

  const renderResult = () => (
    <>
      <div className="text-center">
        <img src="/logo.png" alt="Factosquare Logo" className="logo-image" />
        <p style={{ fontSize: '1.2rem', margin: '0' }}>개당 예상 생산가</p>
        <h3 className="mb-4">{formatPrice(unitPrice.min)} ~ {formatPrice(unitPrice.max)}</h3>
        <p style={{ fontSize: '1.2rem', margin: '0' }}>총 예상 생산가</p>
        <h2>{formatPrice(estimate.min)} ~ {formatPrice(estimate.max)}</h2>
      </div>
      <Row className="mt-4"><Col className="d-grid"><Button size="lg" href="https://factosquare.com/contact/" target="_blank" variant="secondary">지금 바로 문의하기</Button></Col></Row>
    </>
  );

  return (
    <Container className="mt-5">
      <Card className="glass-card">
        {view === 'form' && <Card.Header as="h2" className="text-center">1분 만에<br />견적 확인하기</Card.Header>}
        <Card.Body>{view === 'form' ? renderForm() : renderResult()}</Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ color: 'white', fontWeight: 'bold' }}>정보를 입력해주시면,<br/>결과 화면에서 단가를 확인할 수 있습니다.</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>이름 / 직책</Form.Label>
              <Form.Control type="text" name="name" value={userInfo.name} onChange={handleUserInfoChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>브랜드명</Form.Label>
              <Form.Control type="text" name="brand" value={userInfo.brand} onChange={handleUserInfoChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>이메일 주소</Form.Label>
              <Form.Control type="email" name="email" value={userInfo.email} onChange={handleUserInfoChange} isInvalid={!isEmailValid} />
              <Form.Control.Feedback type="invalid">
                올바른 이메일 형식을 입력해주세요.
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-center">
          <Button variant="primary" onClick={handleConfirmEstimate} disabled={!userInfo.name || !userInfo.brand || !userInfo.email || !isEmailValid}>
            예상 견적 바로 확인하기
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default App;
