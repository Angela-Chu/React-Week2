// 引入套件
import { useState } from "react";
import axios from "axios";
import "./assets/style.css";

// API 設定
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;
// console.log("API_BASE =", import.meta.env.VITE_API_BASE);

function App() {
  const [formData, setformData] = useState({
    username: "",
    password: "",
  });
  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // console.log(name, value); 突然發現setformData加上去後，這行沒有註解掉的話，似乎瀏覽器的console就可以直接看到輸入的密碼?
    setformData((preData) => ({
      ...preData,
      [name]: value,
    }));
  };

  const onSubmit = async (e) => {
    try {
      e.preventDefault(); // 停用預設事件的觸發
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = response.data;
      // 設定cookies
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      axios.defaults.headers.common["Authorization"] = token;
      getProduct(); // 登入成功後取得產品列表
      setIsAuth(true);
    } catch (error) {
      setIsAuth(false); // 登入失敗要改回false
      console.log(error.response);
    }
  };

  const checkLogin = async () => {
    try {
      // 讀取 Cookie
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("hexToken="))
        ?.split("=")[1];
      axios.defaults.headers.common["Authorization"] = token;
      const response = await axios.post(`${API_BASE}/api/user/check`);
      console.log(response.data);
    } catch (error) {
      console.log(error.response?.data.message);
    }
  };

  const getProduct = async () => {
    try {
      // 取得產品資料
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products`,
      );
      console.log("產品資料：", response.data);
      setProducts(response.data.products);
    } catch (error) {
      console.log(error.response);
    }
  };

  return (
    <>
      {!isAuth ? (
        <div className="container login">
          <h1>請先登入</h1>
          <form className="form-floating" onSubmit={(e) => onSubmit(e)}>
            <div className="form-floating mb-3">
              {/* input 標籤要記得關閉，補上「/」 */}
              <input
                type="email"
                className="form-control"
                name="username" /* 同API文件，id建議改成name */
                placeholder="name@example.com"
                value={formData.username} //Input輸入框綁定值
                onChange={(e) => handleInputChange(e)}
              />
              <label htmlFor="username" /* 同API文件， for要改成htmlFor */>
                Email address
              </label>
            </div>
            <div className="form-floating">
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange(e)}
              />
              <label htmlFor="password">Password</label>
            </div>
            <button type="submit" className="btn btn-primary w-100 mt-2">
              登入
            </button>
          </form>
        </div>
      ) : (
        <div className="container">
          <div className="row mt-2">
            <div className="col-md-6">
              {/* 功能按鈕 */}
              <button
                className="btn btn-danger mb-5"
                type="button"
                onClick={() => checkLogin()}
              >
                確認是否登入
              </button>
              <h2>產品列表</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">產品名稱</th>
                    <th scope="col">原價</th>
                    <th scope="col">售價</th>
                    <th scope="col">是否啟用</th>
                    <th scope="col">查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <th scope="row">{product.title}</th>
                      <td>{product.origin_price}</td>
                      <td>{product.price}</td>
                      <td>{product.is_enabled ? "啟用" : "未啟用"}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setTempProduct(product)}
                        >
                          查看
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              <h2>產品明細</h2>
              {tempProduct ? (
                <div className="card">
                  <img
                    src={tempProduct.imageUrl}
                    style={{ height: "300px" }}
                    class="card-img-top"
                    alt="主圖"
                  />
                  <div className="card-body">
                    <h5 className="card-title">{tempProduct.title}</h5>
                    <p className="card-text">
                      商品描述：{tempProduct.description}
                    </p>
                    <p className="card-text">商品內容：{tempProduct.content}</p>
                    <div className="d-flex">
                      <del className="text-secondary">
                        {tempProduct.origin_price}
                      </del>{" "}
                      元 /{tempProduct.price} 元
                    </div>
                    <h5 className="card-text">更多圖片</h5>
                    <div className="d-flex flex-wrap">
                      {tempProduct.imagesUrl.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          style={{ height: "100px", marginRight: "5px" }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p>請選擇產品</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
