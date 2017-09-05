import ajax from './ajax';


describe('ajax', () => {


  describe('.send()', () => {

    let mockXmlRequest;

    beforeEach(() => {
      mockXmlRequest = {
        name: 'fakeXmlHttpRequest',
        open: jest.fn(),
        send: jest.fn(),
        setRequestHeader: jest.fn(),
      };

      ajax.getXmlRequest = jest.fn(() => mockXmlRequest);
    });


    it('calls req.send() without data once if method is GET', () => {
      ajax.send('GET', 'https://fake.url');

      expect(mockXmlRequest.send.mock.calls.length).toBe(1);
      expect(mockXmlRequest.send.mock.calls[0][0]).toBe(undefined);
    });


    it('calls req.setRequestHeader and req.send() with data once if method is POST', () => {
      const mockData = 'mockData';

      ajax.send('POST', 'https://fake.url', null, null, mockData);

      expect(mockXmlRequest.setRequestHeader.mock.calls.length).toBe(1);
      expect(mockXmlRequest.setRequestHeader.mock.calls[0][0]).toBe('Content-type');
      expect(mockXmlRequest.setRequestHeader.mock.calls[0][1]).toBe('application/json');
      expect(mockXmlRequest.send.mock.calls.length).toBe(1);
      expect(mockXmlRequest.send.mock.calls[0][0]).toBe(mockData);
    });


    it('calls successCb if status code is in the 200\'s', () => {
      let mockSuccessCb = jest.fn();
      let mockErrorCb = jest.fn();

      const mock200Event = {
        target: {
          readyState: 4,
          status: 200,
          responseText: 'responseText',
        }
      };

      ajax.send('GET', 'https://fake.url', mockSuccessCb, mockErrorCb);

      mockXmlRequest.onreadystatechange(mock200Event);
      expect(mockSuccessCb.mock.calls.length).toBe(1);
      expect(mockSuccessCb.mock.calls[0][0]).toBe(mock200Event.target.responseText);
      expect(mockErrorCb.mock.calls.length).toBe(0);

      mockSuccessCb = jest.fn();
      mockErrorCb = jest.fn();

      const mock299Event = {
        target: {
          readyState: 4,
          status: 299,
          responseText: 'responseText',
        }
      };

      ajax.send('GET', 'https://fake.url', mockSuccessCb, mockErrorCb);

      mockXmlRequest.onreadystatechange(mock299Event);
      expect(mockSuccessCb.mock.calls.length).toBe(1);
      expect(mockSuccessCb.mock.calls[0][0]).toBe(mock299Event.target.responseText);
      expect(mockErrorCb.mock.calls.length).toBe(0);
    });


    it('calls errorCb if status code is not in the 200\'s', () => {
      let mockSuccessCb = jest.fn();
      let mockErrorCb = jest.fn();

      const mock199Event = {
        target: {
          readyState: 4,
          status: 199,
          responseText: 'responseText',
        }
      };

      ajax.send('GET', 'https://fake.url', mockSuccessCb, mockErrorCb);

      mockXmlRequest.onreadystatechange(mock199Event);
      expect(mockErrorCb.mock.calls.length).toBe(1);
      expect(mockErrorCb.mock.calls[0][0]).toBe(mock199Event.target.responseText);
      expect(mockSuccessCb.mock.calls.length).toBe(0);

      mockSuccessCb = jest.fn();
      mockErrorCb = jest.fn();

      const mock300Event = {
        target: {
          readyState: 4,
          status: 300,
          responseText: 'responseText',
        }
      };

      ajax.send('GET', 'https://fake.url', mockSuccessCb, mockErrorCb);

      mockXmlRequest.onreadystatechange(mock300Event);
      expect(mockErrorCb.mock.calls.length).toBe(1);
      expect(mockErrorCb.mock.calls[0][0]).toBe(mock300Event.target.responseText);
      expect(mockSuccessCb.mock.calls.length).toBe(0);
    });

  });

});
