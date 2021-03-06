import React from "react";
import { Card, CardBody, Badge, Row, Col } from "shards-react";
import { withTranslation } from 'react-i18next';

class BasicCard extends React.Component {



  render() {
    const { t } = this.props;
    let about_us_content = {
       backgroundImage: require("../../images/content-management/bg_about.jpg"),
       category: "About Us",
       categoryTheme: "dark",
       author: "Anna Kunis",
       authorAvatar: require("../../images/avatars/1.jpg")
     };

     let version_content = {
        backgroundImage: require("../../images/content-management/version_bg.jpg"),
        category: "System Details",
        categoryTheme: "dark",
        author: "Anna Kunis",
        authorAvatar: require("../../images/avatars/1.jpg"),
        title: "EMon - Details",
        line1:
          "Site version: v.0.0.1 - Alpha",
        line2:
          "Powered by ReactJS with ❤️"
      };

    return (
      <Row>
        <Col lg="8" md="12" sm="12" className="mb-4">
          <Card small className="card-post card-post--1">
            <div
              className="card-post__image"
              style={{ backgroundImage: `url(${about_us_content.backgroundImage})` }}
            >
              <Badge
                pill
                className={`card-post__category bg-${about_us_content.categoryTheme}`}
              >
                {about_us_content.category}
              </Badge>
            </div>
            <CardBody>
              <h5 className="card-title">
                <a href="#" className="text-fiord-blue">
                  {t("WelcomeToEMon")}
                </a>
              </h5>
              <p className="card-text d-inline-block mb-3">{t("WelcomeBody")}</p>
              <p className="card-text d-inline-block mb-3">{t("WelcomeBody1")}</p>
            </CardBody>
          </Card>
        </Col>
        <Col lg="4" md="12" sm="12" className="mb-4">
          <Card small className="card-post card-post--1">
            <div
              className="card-post__image"
              style={{ backgroundImage: `url(${version_content.backgroundImage})` }}
            >
              <Badge
                pill
                className={`card-post__category bg-${version_content.categoryTheme}`}
              >
                {version_content.category}
              </Badge>
            </div>
            <CardBody>
              <h5 className="card-title">
                <a href="#" className="text-fiord-blue">
                  {version_content.title}
                </a>
              </h5>
              <p className="card-text d-inline-block mb-3">{version_content.line1}
                                                          <br />
                                                            {version_content.line2}</p>
            </CardBody>
          </Card>
        </Col>
      </Row>
    );
  }
}

export default withTranslation()(BasicCard);
